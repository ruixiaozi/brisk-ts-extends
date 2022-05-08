#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const __root = process.cwd();
const TYPE_REGEXP = /export declare (?:class|enum|interface)\s*(?<name>[A-Z_]\w*)\s*(?<extends>[^{]*)\s*\{(?<content>[\S\s]*?)\}/ug;

const paramTypesDir = process.argv?.find((arg: string) => arg?.startsWith('--typesdir'))?.split('=')
  ?.pop();
if (!paramTypesDir) {
  throw new Error('no --typesdir');
}

const typesDir = path.join(__root, paramTypesDir);

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
        console.log(file, typeMatch.groups);

        /*
         * const typeName = typeMatch.groups?.name;
         * const typeExtends = typeMatch.groups?.extends;
         * const content = typeMatch.groups?.content;
         */

        // if (typeName) {
        //   typeObj[interfaceName] = {};
        //   const mathRes = content?.replaceAll(/\/\*(?:\s|.)*?\*\//ug, '')
        //     .replaceAll(/(?<!:)\/\/.*/ug, '')
        //     .replaceAll(/\s*/ug, '')
        //     .matchAll(/(?<key>[a-zA-Z_]+\w*)(?<canUndefined>\?*):(?<typeName>(?:[^;|]+\|*)+);/ug);
        //   if (!mathRes) {
        //     continue;
        //   }
        //   for (let match of [...mathRes]) {
        //     toTypes(match, interfaceName);
        //   }
        // }
      }
    } else if (stat.isDirectory()) {
      dfsReadFile(filePath);
    }
  });
}

dfsReadFile(typesDir);

