export type Class<T = any> = new (...args: Array<any>)=> T;
export type Target = Class | object;
export type Key = string | symbol;

export type TypeKind = string;

export interface PropertiesDes {
  key: string;
  type: Array<TypeKind> | TypeKind;
  option: boolean;
  default?: string;
  meta?: any;
}

export interface ParamsDes {
  key: string;
  type: Array<TypeKind> | TypeKind;
  option: boolean;
  default?: string;
  meta?: any;
}

export interface FunctionsDes {
  name: string;
  returnType: Array<TypeKind> | TypeKind;
  params: Array<ParamsDes>;
  meta?: any;
}


export interface TypeDes {
  properties: PropertiesDes[];
  functions: FunctionsDes[];
  parents: Array<string>;
  propertiesStatic?: PropertiesDes[];
  functionsStatic?: FunctionsDes[];
  meta?: any;
}

export type DescOrNum = PropertyDescriptor | number;
export type Decorator = (
  target: Target,
  key?: Key,
  descriptorOrIndex?: DescOrNum
) => any;
// 类装饰器回调方法类型
export type ClassCallbackFunc = (
  target: Class,
  targetTypeDes?: TypeDes
) => Class | void;
// 属性装饰器回调方法类型
export type PropertyCallbackFunc = (
  target: any,
  key: Key,
  propertiesDes?: PropertiesDes,
) => void;
// 参数装饰器回调方法类型
export type ParamCallbackFunc = (
  target: any,
  key: Key,
  index: number,
  param?: ParamsDes,
) => void;
// 方法、访问器装饰器回调方法类型
export type MethodCallbackFunc = (
  target: any,
  key: Key,
  descriptor: PropertyDescriptor,
  functionDes?: FunctionsDes,
) => PropertyDescriptor | void;

