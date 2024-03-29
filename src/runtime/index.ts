import { TypeDes, TypeKind } from '../types';

// 保存运行时类型
const globalVal: {
  __briskRuntimeTypes?: { [key: string]: TypeDes },
  [key: string | symbol | number]: any,
} = globalThis;

if (!globalVal.__briskRuntimeTypes) {
  globalVal.__briskRuntimeTypes = {};
}

/**
 * 判断值的类型是否与类型字符串一直
 * 只判断数组、字符串、数字、boolean、方法，其他类型默认通过
 * @param type 类型字符串
 * @param value 值
 * @returns
 */
function equalType(type: TypeKind, value: any): boolean {
  // 检查数组
  if (type.startsWith('Array:')) {
    if (!Array.isArray(value)) {
      return false;
    }
    const elementType = type.substring(6);
    // 每个元素类型都符合
    return value.every((val: any) => equalType(elementType, val));
  }

  if (['string', 'number', 'boolean', 'function'].includes(type)) {
    return typeof value === type;
  }

  // 其他类型默认true
  return true;
}

/**
 * 添加类型定义
 * @param typeName 类型名称
 * @param typeDes 类型详情描述
 */
export function append(typeName: string, typeDes: TypeDes) {
  // 如果类型定义已经存在（同名），给出警告
  if (globalVal.__briskRuntimeTypes![typeName]) {
    console.warn(`${typeName} is exist!`);
  }
  globalVal.__briskRuntimeTypes![typeName] = typeDes;
}


/**
 * 获取父类型（用于泛型定义）
 * @param kind 类型
 * @returns
 */
export function getParentTypeKind(kind: TypeKind | TypeKind[]) {
  // 联合类型不处理
  if (Array.isArray(kind)) {
    return kind;
  }
  const inx = kind.indexOf('.');
  return inx === -1 ? kind : kind.substring(0, inx);
}

/**
 * 获取子类型（用于泛型定义）
 * @param kind 类型
 * @returns
 */
export function getSubTypeKind(kind: TypeKind | TypeKind[]) {
  // 联合类型不处理
  if (Array.isArray(kind)) {
    return kind;
  }
  const inx = kind.indexOf('.');
  return inx === -1 ? kind : kind.substring(inx + 1);
}

/**
 * 获取类型定义
 * @param typeName 类型名称
 * @returns
 */
export function get(typeName: string) {
  const parentType = getParentTypeKind(typeName) as string;
  const subType = getSubTypeKind(typeName) as string;
  // 非泛型
  if (parentType === subType) {
    return globalVal.__briskRuntimeTypes![typeName];
  }

  // 泛型

  // 非内置泛型
  if (!['Partial', 'Required'].includes(parentType)) {
    // 其他泛型直接返回带泛型的描述，可能未定义，todo
    return globalVal.__briskRuntimeTypes![typeName];
  }

  const subTypeDes = globalVal.__briskRuntimeTypes![subType];
  // 子类型不存在，直接返回undefined
  if (!subTypeDes) {
    return undefined;
  }

  // 可选与必选
  if (['Partial', 'Required'].includes(parentType)) {
    return {
      ...subTypeDes,
      properties: subTypeDes.properties.map((item) => ({
        ...item,
        option: parentType === 'Partial',
      })),
    };
  }

  return undefined;
}


/**
 * 类型转换，将源对象转成泛型类型；此typeCast重载会在编译时转换为2个参数的重载
 * @param source 源对象
 */
export function typeCast<T>(source: any): T

/**
 * 类型转换，根据目标类型名称进行转换
 * @param source 源对象
 * @param targetTypeName 目标类型名称
 */
export function typeCast<T>(source: any, targetTypeName: string): T

/**
 * 类型转换，将源对象数组转成泛型类型；此typeCast重载会在编译时转换为2个参数的重载
 * @param sources 源对象数组
 */
export function typeCast<T>(sources: any[]): T

/**
 * 类型转换，根据目标类型名称将源对象数组进行转换
 * @param sources 源对象数组
 * @param targetTypeName 目标类型名称
 */
export function typeCast<T>(sources: any[], targetTypeName: string): T
export function typeCast<T>(source: any | any[], targetTypeName?: string): T {
  const res: any = {};
  // 没找到对应的类型定义v
  if (!targetTypeName || !globalVal.__briskRuntimeTypes![targetTypeName] || typeof source !== 'object') {
    return res;
  }

  const sourceArr = Array.isArray(source) ? source : [source];

  // 将类型里有的字段转换过去，如果source为数组，则后续相同字段将覆盖前面的，没有的字段留空
  for (let prop of globalVal.__briskRuntimeTypes![targetTypeName].properties) {
    for (let sourceObj of sourceArr) {
      if (sourceObj[prop.key] === undefined) {
        continue;
      }
      // 单类型，类型匹配才赋值
      if (!Array.isArray(prop.type)) {
        if (equalType(prop.type, sourceObj[prop.key])) {
          res[prop.key] = sourceObj[prop.key];
        }
        continue;
      }

      // 联合类型，满足其中一种就行，满足才赋值
      for (let type of prop.type) {
        if (equalType(type, sourceObj[prop.key])) {
          res[prop.key] = sourceObj[prop.key];
          break;
        }
      }
    }
  }

  return res;
}


/**
 * 根据实际对象和对象名称，判断类型
 * @param target 实际对象
 * @param typeName 类型名称
 * @param allOption 所有属性可选，默认false
 */
export function isLike<T>(target: any, typeName: string): target is T;

/**
 * 根据泛型判断实际对象的类型，此isLike重载会在编译时转换为2个参数的重载
 * @param target 实际对象
 */
export function isLike<T>(target: any): target is T;
// eslint-disable-next-line complexity
export function isLike<T>(target: any, typeName?: string): target is T {
  const targetTypeof = typeof target;
  // 不是对象、字符串和数字
  if (!typeName
    || (targetTypeof !== 'object' && targetTypeof !== 'string' && targetTypeof !== 'number')) {
    return false;
  }

  // 枚举类型
  if (targetTypeof === 'string' || targetTypeof === 'number') {
    const { enums } = get(typeName) || {};
    // 如果没有枚举定义，则返回失败
    if (!enums) {
      return false;
    }
    // 判断值是否再枚举列表内
    return enums.includes(String(target));
  }

  const typeDes = get(typeName);

  // 没有实际类型
  if (!typeDes) {
    return false;
  }

  // 只检查类型里面约定了，额外的属性不用比较
  for (let prop of typeDes.properties) {
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
    for (let type of prop.type) {
      if (equalType(type, target[prop.key])) {
        unionRes = true;
      }
    }
    if (!unionRes) {
      return false;
    }
  }

  // 过滤掉一些可继承的内置类型，如果当前类型继承自这些类型，则不用再检查这些内置
  const typeParents = typeDes.parents
    ?.filter((item) => !['Error', 'Array'].includes(item));

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
