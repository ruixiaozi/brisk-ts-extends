// 扫描执行路径下的所有ts文件，将接口、枚举转换成json
import * as fs from 'fs';

let config: any = {};


export function configPath(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error('brisk-ts-extends: [is] module config path is not exists');
  }
  let theConfig = require(path);
  if (typeof theConfig !== 'object') {
    throw new Error('brisk-ts-extends: [is] module config is error');
  }
  config = {
    ...config,
    ...theConfig,
  };
}

export function is<T>(target: any, typeName: string): target is T {
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
      } else {
        isRight ||= typeof target[key] === typeStr;
      }
    }
    if (!isRight) {
      return false;
    }
  }

  return true;
}

