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


/**
 * DecoratorFactory
 * @description 装饰器工厂
 * @author ruixiaozi
 * @email admin@ruixiaozi.com
 * @date 2022年04月04日 17:14:04
 * @version 1.1.0
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
    return (target: Target, key?: Key, descriptorOrIndex?: DescOrNum): void => {
      // 只有一个参数，类装饰器
      if (target !== undefined && key === undefined && descriptorOrIndex === undefined) {
        const cTarget = target as Class;
        this._classCallback && this._classCallback(cTarget);
        return;
      }

      // 只有两个参数，属性装饰器
      if (target !== undefined && key !== undefined && descriptorOrIndex === undefined) {
        const oTarget = target as any;
        this._propertyCallback && this._propertyCallback(oTarget, key);
        return;
      }

      // 三个参数
      if (target !== undefined && key !== undefined && descriptorOrIndex !== undefined) {
        const oTarget = target as any;
        if (typeof descriptorOrIndex === 'number') {
          // 第三个参数为数字，参数装饰器
          this._paramCallback && this._paramCallback(oTarget, key, descriptorOrIndex);
          return;
        }

        // 方法和访问器装饰器
        this._methodCallback && this._methodCallback(oTarget, key, descriptorOrIndex);
      }
    };
  }

}
