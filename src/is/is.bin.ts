#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const __root = process.cwd();

const paramSource = process.argv?.find((arg: string) => arg?.startsWith('--source'))?.split('=')
  ?.pop();
if (!paramSource) {
  throw new Error('no --source');
}

const paramOutput = process.argv?.find((arg: string) => arg?.startsWith('--output'))?.split('=')
  ?.pop();
if (!paramOutput) {
  throw new Error('no --output');
}

// 设置系统参数
const srcdir = path.join(__root, paramSource);

const output = path.join(__root, paramOutput);

let typeObj: any = {

};

function toTypes(match: RegExpMatchArray, interfaceName: string) {
  const key = match.groups?.key;
  const typeName = match.groups?.typeName;
  const canUndefined = match.groups?.canUndefined === '?';
  if (key && typeName) {
    const typeList = typeName.split('|').map((item) => {
      let itemRe = item.trim();

      let itemReLower = itemRe.toLowerCase();

      if (itemReLower === 'string' || itemReLower === 'number' || itemReLower === 'boolean' || itemReLower === 'undefined') {
        return itemReLower;
      }

      if (/^['"].*['"]$/u.test(itemRe)) {
        return 'string';
      }

      if (/^\d+$/u.test(itemRe)) {
        return 'number';
      }

      if (/^(?:true|false)$/u.test(itemRe)) {
        return 'boolean';
      }

      return 'any';
    });
    canUndefined && typeList.push('undefined');

    typeObj[interfaceName][key] = [...new Set(typeList)];
  }
}

function dfsReadFile(dir: string) {
  const files = fs.readdirSync(dir);


  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && file.endsWith('.ts')) {
      const res = fs.readFileSync(filePath, { encoding: 'utf-8' });
      const interfaceRegexp = /interface\s*(?<interfaceName>[A-Z_]\w*)\s*(?:extends\s*.*)*\{(?<content>[\S\s]*?)\}/ug;
      const interfaceMatchAll = res.matchAll(interfaceRegexp);

      for (let interfaceMatch of [...interfaceMatchAll]) {
        const interfaceName = interfaceMatch.groups?.interfaceName;
        const content = interfaceMatch.groups?.content;

        if (interfaceName) {
          typeObj[interfaceName] = {};
          const mathRes = content?.replaceAll(/\/\*(?:\s|.)*?\*\//ug, '')
            .replaceAll(/(?<!:)\/\/.*/ug, '')
            .replaceAll(/\s*/ug, '')
            .matchAll(/(?<key>[a-zA-Z_]+\w*)(?<canUndefined>\?*):(?<typeName>(?:[^;|]+\|*)+);/ug);
          if (!mathRes) {
            continue;
          }
          for (let match of [...mathRes]) {
            toTypes(match, interfaceName);
          }
        }
      }
    } else if (stat.isDirectory()) {
      dfsReadFile(filePath);
    }
  });
}

dfsReadFile(srcdir);


fs.writeFileSync(output, JSON.stringify(typeObj, null, 2));
