#!/usr/bin/env node
/* eslint-disable max-lines-per-function */
import { RuntimeMethod, RuntimeType, RuntimeAttribute, RuntimeTypeContainer } from './runtime';
import * as fs from 'fs';
import * as path from 'path';

const __root = process.cwd();
const TYPE_REGEXP = /export declare (?:class|interface)\s*(?<name>[A-Z_]\w*)\s*(?<extends>[^{]*)\s*\{(?<content>[\S\s]*?)\}/ug;
// eslint-disable-next-line max-len
const PROPERTY_REGEXP = /^(?:public\s+){0,1}(?<isStatic>static\s+){0,1}(?<name>[a-zA-Z_]+\w*)\s*(?<canUndefined>\?{0,1})\s*:\s*(?<types>(?:[^;|]+\|*)+)/u;
// eslint-disable-next-line max-len
const METHOD_REGEXP = /^(?:public\s+){0,1}(?<isStatic>static\s+){0,1}(?<name>[a-zA-Z_]+\w*)\s*\(\s*(?<params>[^()]*)\s*\)\s*:\s*(?<returnTypes>(?:[^;|]+\|*)+)/u;

const paramTypesDir = process.argv?.find((arg: string) => arg?.startsWith('--typesdir'))?.split('=')
  ?.pop();
if (!paramTypesDir) {
  throw new Error('no --typesdir');
}

const typesDir = path.join(__root, paramTypesDir);

function spiltTypes(types?: string, canUndefined?: boolean) {
  if (!types) {
    return [];
  }
  const re: Set<string> = new Set();
  if (canUndefined) {
    re.add('undefined');
  }
  const typesStr = `${types}|`;
  let tmp = '';
  let leftCount = 0;
  for (let i = 0; i < typesStr.length; i++) {
    const ch = typesStr.charAt(i);
    switch (ch) {
      case '<':
        leftCount++;
        tmp += ch;
        break;
      case '>':
        tmp += ch;
        if (leftCount > 0) {
          leftCount--;
        }
      // eslint-disable-next-line no-fallthrough
      case '|':
        if (leftCount === 0) {
          if (tmp) {
            re.add(tmp);
            tmp = '';
          }
        } else if (ch !== '>') {
          tmp += ch;
        }
        break;
      case ' ':
        break;
      default:
        tmp += ch;
        break;
    }
  }
  return [...re];
}

// 深度获取d.ts
function dfsReadFile(dir: string) {
  const files = fs.readdirSync(dir);


  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && file.endsWith('d.ts')) {
      const res = fs.readFileSync(filePath, { encoding: 'utf-8' });
      const typeMatchAll = res.matchAll(TYPE_REGEXP);

      for (let typeMatch of [...typeMatchAll]) {
        const typeName = typeMatch.groups?.name;
        // 扩展待实现
        // const typeExtends = typeMatch.groups?.extends;
        const content = typeMatch.groups?.content;
        if (typeName) {
          const contentRes = content?.replaceAll(/\/\*(?:\s|.)*?\*\//ug, '')
            .replaceAll(/(?<!:)\/\/.*/ug, '')
            .split(';')
            .map((item) => item.replaceAll(/^\s*/ug, '').replaceAll(/\s*$/ug, ''))
            .filter((item) => item && !item.includes('private') && !item.includes('readonly'));

          const runtimeType: RuntimeType = {
            name: typeName,
            properties: [],
            methods: [],
          };

          contentRes?.forEach((item) => {
            let match = item.match(PROPERTY_REGEXP);
            if (match && match.groups?.name) {
              // 对types进行处理
              const runtimeAttribute: RuntimeAttribute = {
                name: match.groups?.name,
                isStatic: Boolean(match.groups?.isStatic),
                typeNames: spiltTypes(match.groups?.types, Boolean(match.groups?.canUndefined)),
              };
              runtimeType.properties?.push(runtimeAttribute);
              return;
            }
            match = item.match(METHOD_REGEXP);
            if (match && match.groups?.name) {
              const params: RuntimeAttribute[] = (match.groups?.params || '').split(',')
                .map((param) => {
                  const [name, types] = param.split(':').map((paramItem) => paramItem.trim());
                  const canUndefined = name.includes('?');
                  return {
                    name: name.replace('?', ''),
                    typeNames: spiltTypes(types, canUndefined),
                  };
                });
              const runtileMethod: RuntimeMethod = {
                name: match.groups?.name,
                isStatic: Boolean(match.groups?.isStatic),
                params,
                returnTypeNames: spiltTypes(match.groups?.returnTypes),
              };
              runtimeType.methods?.push(runtileMethod);
            }
          });

          RuntimeTypeContainer.put(runtimeType);
        }
      }
    } else if (stat.isDirectory()) {
      dfsReadFile(filePath);
    }
  });
}


dfsReadFile(typesDir);
RuntimeTypeContainer.writeToFile();
