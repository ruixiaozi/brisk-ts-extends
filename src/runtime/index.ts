import { TypeDes } from '../types';

// 保存运行时类型
const runtimeTypes: { [key: string]: TypeDes } = {};

/**
 * 判断值的类型是否与类型字符串一直
 * @param typeStr 类型字符串
 * @param value 值
 * @returns
 */
function equalType(typeStr: string, value: any) {
  return typeStr === 'any' || typeof value === typeStr;
}

/**
 * 添加类型定义
 * @param typeName 类型名称
 * @param typeDes 类型详情描述
 */
export function append(typeName: string, typeDes: TypeDes) {
  // 如果类型定义已经存在（同名），给出警告
  if (runtimeTypes[typeName]) {
    console.warn(`${typeName} is exist!`);
  }
  runtimeTypes[typeName] = typeDes;
}

/**
 * 获取类型定义
 * @param typeName 类型名称
 * @returns
 */
export function get(typeName: string) {
  return runtimeTypes[typeName];
}


/**
 * 根据实际对象和对象名称，判断类型
 * @param target 实际对象
 * @param typeName 类型名称
 */
export function isLike<T>(target: any, typeName: string): target is T;

/**
 * 根据泛型判断实际对象的类型
 * @param target 实际对象
 */
export function isLike<T>(target: any): target is T;
export function isLike<T>(target: any, typeName?: string): target is T {
  // 没找到对应的类型定义v
  if (!typeName || !runtimeTypes[typeName] || typeof target !== 'object') {
    return false;
  }

  // 只检查类型里面约定了，额外的属性不用比较
  for (let prop of runtimeTypes[typeName].properties) {
    // 可选属性，并且值为undefined，跳过
    if (prop.option && typeof target[prop.key] === 'undefined') {
      continue;
    }

    // 单类型
    if (!Array.isArray(prop.type)) {
      if (!equalType(prop.type, target[prop.key])) {
        return false;
      }
      continue;
    }

    // 联合类型，满足其中一种就行
    let unionRes = false;
    for (let typeStr of prop.type) {
      if (equalType(typeStr, target[prop.key])) {
        unionRes = true;
      }
    }
    if (!unionRes) {
      return false;
    }
  }

  const typeParents = runtimeTypes[typeName].parents;

  if (typeParents) {
    for (let parent of typeParents) {
      // 递归检查继承的类型
      if (!isLike(target, parent)) {
        return false;
      }
    }
  }

  return true;
}
