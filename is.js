"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.is = exports.configPath = void 0;
// 扫描执行路径下的所有ts文件，将接口、枚举转换成json
const fs = __importStar(require("fs"));
let config = {};
function configPath(path) {
    if (!fs.existsSync(path)) {
        throw new Error('brisk-ts-extends: [is] module config path is not exists');
    }
    config = require(path);
    if (typeof config !== 'object') {
        throw new Error('brisk-ts-extends: [is] module config is error');
    }
}
exports.configPath = configPath;
function is(target, typeName) {
    // 没找到对应的类型定义
    if (!config[typeName] || typeof target !== 'object') {
        return false;
    }
    // 类型定义不是对象，错误的格式
    if (typeof config[typeName] !== 'object') {
        throw new Error('brisk-ts-extends: [is] module config is error');
    }
    for (let [key, value] of Object.entries(config[typeName])) {
        if (!Array.isArray(value)) {
            throw new Error('brisk-ts-extends: [is] module config is error');
        }
        let isRight = false;
        for (let typeStr of value) {
            if (typeof typeStr !== 'string') {
                throw new Error('brisk-ts-extends: [is] module config is error');
            }
            if (typeStr === 'any') {
                isRight ||= true;
            }
            else {
                isRight ||= typeof target[key] === typeStr;
            }
        }
        if (!isRight) {
            return false;
        }
    }
    return true;
}
exports.is = is;
