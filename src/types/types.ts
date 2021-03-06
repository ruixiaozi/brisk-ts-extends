import { RuntimeAttribute, RuntimeType } from './runtime';

export type Class<T = any> = new (...args: Array<any>)=> T;
export type Target = Class | object;
export type Key = string | symbol;
export type DescOrNum = PropertyDescriptor | number;
export type Decorator = (
  target: Target,
  key?: Key,
  descriptorOrIndex?: DescOrNum
) => void;
// 类装饰器回调方法类型
export type ClassCallbackFunc = (target: Class, targetDef?: RuntimeType) => void;
// 属性装饰器回调方法类型
export type PropertyCallbackFunc = (
  target: any,
  key: Key,
  typeNames?: string[],
) => void;
// 参数装饰器回调方法类型
export type ParamCallbackFunc = (
  target: any,
  key: Key,
  index: number,
  paramName: string,
  param?: RuntimeAttribute,
) => void;
// 方法、访问器装饰器回调方法类型
export type MethodCallbackFunc = (
  target: any,
  key: Key,
  descriptor: PropertyDescriptor,
  paramNames: string[],
  params?: RuntimeAttribute[],
) => void;
