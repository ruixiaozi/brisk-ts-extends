import {
  Target,
  Key,
  Class,
  DescOrNum,
  Decorator,
  ClassCallbackFunc,
  PropertyCallbackFunc,
  ParamCallbackFunc,
  MethodCallbackFunc,
} from '../types';

import * as runtime from '../runtime';


/**
 * DecoratorFactory
 * @description 装饰器工厂
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年11月30日
 * @sinace 0.0.1
 */
export class DecoratorFactory {

  constructor(
    private _classCallback?: ClassCallbackFunc,
    private _propertyCallback?: PropertyCallbackFunc,
    private _paramCallback?: ParamCallbackFunc,
    private _methodCallback?: MethodCallbackFunc,
  ) {}

  public setClassCallback(func: ClassCallbackFunc): DecoratorFactory {
    this._classCallback = func;
    return this;
  }

  public setPropertyCallback(func: PropertyCallbackFunc): DecoratorFactory {
    this._propertyCallback = func;
    return this;
  }

  public setParamCallback(func: ParamCallbackFunc): DecoratorFactory {
    this._paramCallback = func;
    return this;
  }

  public setMethodCallback(func: MethodCallbackFunc): DecoratorFactory {
    this._methodCallback = func;
    return this;
  }

  public getDecorator(): Decorator {
    return (target: Target, key?: Key, descriptorOrIndex?: DescOrNum): any => {
      // 只有一个参数，类装饰器
      if (target !== undefined && key === undefined && descriptorOrIndex === undefined) {
        const cTarget = target as Class;
        const cTargetType = runtime.get(cTarget.name);
        // 如果返回一个新的构造方法，则作为当前类的构造方法
        return this._classCallback && this._classCallback(cTarget, cTargetType);
      }

      // 只有两个参数，属性装饰器
      if (target !== undefined && key !== undefined && descriptorOrIndex === undefined) {
        const oTarget = target as any;
        const oTargetType = runtime.get(oTarget.name || oTarget.constructor?.name);
        const propertiesDes = oTargetType?.properties?.find((item) => item.key === key);
        this._propertyCallback && this._propertyCallback(oTarget, key, propertiesDes);
        return;
      }

      // 三个参数
      if (target !== undefined && key !== undefined && descriptorOrIndex !== undefined) {
        const oTarget = target as any;
        const oTargetType = runtime.get(oTarget.name || oTarget.constructor?.name);
        const functionDes = oTargetType?.functions?.find((item) => item.name === key);
        if (typeof descriptorOrIndex === 'number') {
          // 第三个参数为数字，参数装饰器
          this._paramCallback && this._paramCallback(oTarget, key, descriptorOrIndex, functionDes?.params?.[descriptorOrIndex]);
          // 参数装饰器没有返回值
          return;
        }

        // 方法和访问器装饰器，如果返回PropertyDescriptor，将此描述符作为方法的属性描述符
        return this._methodCallback && this._methodCallback(oTarget, key, descriptorOrIndex, functionDes);
      }
    };
  }

}
