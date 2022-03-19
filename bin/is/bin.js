#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const __root = process.cwd();
console.log(__root);
// 设置系统参数
const srcdir = path.join(__root, process.argv?.find((arg) => arg?.startsWith('--source'))?.split('=')?.pop() || '');
const output = path.join(__root, process.argv?.find((arg) => arg?.startsWith('--output'))?.split('=')?.pop() || 'default.json');
let typeObj = {};
function dfsReadFile(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile() && file.endsWith('.ts')) {
            const res = fs.readFileSync(filePath, { encoding: 'utf-8' });
            const interfaceName = /interface\s*(?<interfaceName>[A-Z\_]\w*)\s*\{/g.exec(res)?.groups?.interfaceName;
            if (interfaceName) {
                typeObj[interfaceName] = {};
                const mathRes = res.matchAll(/(?<key>[a-zA-Z\_]+\w*)\s*(?<canUndefined>\?*)\s*\:\s*(?<typeName>(?:\w+\s*\|*\s*)*)\s*\;/g);
                for (let match of mathRes) {
                    const key = match.groups?.key;
                    const typeName = match.groups?.typeName;
                    const canUndefined = match.groups?.canUndefined === '?';
                    if (key && typeName) {
                        const typeList = typeName.split("|").map(item => {
                            let itemRe = item.trim();
                            let itemReLower = itemRe.toLowerCase();
                            if (itemReLower === 'string' || itemReLower === 'number' || itemReLower === 'boolean' || itemReLower === 'undefined') {
                                return itemReLower;
                            }
                            if (/^[\'\"].*[\'\"]$/.test(itemRe)) {
                                return 'string';
                            }
                            if (/^\d+$/.test(itemRe)) {
                                return 'number';
                            }
                            if (/^(true|false)$/.test(itemRe)) {
                                return 'boolean';
                            }
                            return 'object';
                        });
                        canUndefined && typeList.push('undefined');
                        typeObj[interfaceName][key] = [
                            ...new Set(typeList)
                        ];
                    }
                }
            }
        }
        else if (stat.isDirectory()) {
            dfsReadFile(filePath);
        }
    });
}
dfsReadFile(srcdir);
fs.writeFileSync(output, JSON.stringify(typeObj, null, 2));
