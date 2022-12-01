import { DecoratorFactory } from "../src/decorator";
import { get} from '../src/runtime/index';
import { FunctionsDes } from "../src/types";


describe('decorator', () => {

  // DecoratorFactory.getDecorator方法应该返回一个类装饰器，当调用DecoratorFactory.setClassCallback后
  test('DecoratorFactory.getDecorator Should return a class decorator When call DecoratorFactory.setClassCallback', () => {
    const singletons: any = {};
    function ClassDecoratorTest() {
      return new DecoratorFactory()
        .setClassCallback((Target, targetDes) => {
          singletons[Target.name] = {
            instance: new Target(),
            des: targetDes,
          };
        })
        .getDecorator();
    }

    @ClassDecoratorTest()
    class Test1 {
      test = 1;
    }

    expect(singletons['Test1']?.instance?.test).toEqual(1);
    expect(singletons['Test1']?.des?.properties?.[0]?.key).toEqual('test');
  })

  // DecoratorFactory.getDecorator方法应该返回一个类装饰器，当调用DecoratorFactory.setClassCallback，并返回一个新的构造方法
  test('DecoratorFactory.getDecorator Should return a class decorator When call DecoratorFactory.setClassCallback and return new constructor', () => {
    function ClassDecoratorTest() {
      return new DecoratorFactory()
        .setClassCallback((Target, targetDes) => {
          return class extends Target {
            test = 1;
            test2 = 2;
          }
        })
        .getDecorator();
    }

    @ClassDecoratorTest()
    class Test11 {
      test = 1;
    }

    const test11 = new Test11();
    expect(test11.test).toEqual(1);
    expect((test11 as any).test2).toEqual(2);
  })

  // DecoratorFactory.getDecorator方法应该返回一个属性装饰器，当调用DecoratorFactory.setPropertyCallback后
  test('DecoratorFactory.getDecorator Should return a property decorator When call DecoratorFactory.setPropertyCallback', () => {
    function PropertyDecoratorTest() {
      return new DecoratorFactory()
        .setPropertyCallback((target, key, propertiesDes) => {
          Reflect.defineProperty(target, key, {
            enumerable: true,
            configurable: false,
            get() {
              return {
                myName: propertiesDes?.key,
                myValue: propertiesDes?.default,
              };
            },
            set(value) {}
          });
        })
        .getDecorator();
    }

    class Test2 {
      @PropertyDecoratorTest()
      test = 1;
    }

    const test2 = new Test2();

    expect((test2.test as any).myName).toEqual('test');
    expect((test2.test as any).myValue).toEqual('1');
  })

  // DecoratorFactory.getDecorator方法应该返回一个参数装饰器，当调用DecoratorFactory.setParamCallback后
  test('DecoratorFactory.getDecorator Should return a parameter decorator When call DecoratorFactory.setParamCallback', () => {
    function ParamDecoratorTest(option?: any) {
      return new DecoratorFactory()
        .setParamCallback((target, key, index, param) => {
          if (param) {
            param.meta = option;
          }
        })
        .getDecorator();
    }

    class Test3 {
      test(@ParamDecoratorTest({ required: true }) param1: string) {
        console.log(param1);
      }
    }

    const test3Des = get('Test3');
    expect(test3Des.functions?.[0]?.params?.[0]?.meta?.required).toEqual(true);
  })

  // DecoratorFactory.getDecorator方法应该返回一个方法装饰器，当调用DecoratorFactory.setMethodCallback后
  test('DecoratorFactory.getDecorator Should return a method decorator When call DecoratorFactory.setMethodCallback', () => {
    let methodDes: FunctionsDes | undefined;
    function MethodDecoratorTest() {
      return new DecoratorFactory()
        .setMethodCallback((target, key, descriptor, functionDes) => {
          if (functionDes) {
            methodDes = functionDes;
          }
        })
        .getDecorator();
    }

    class Test4 {
      @MethodDecoratorTest()
      test(param1: string) {
        console.log(param1);
      }
    }
    expect(methodDes?.name).toEqual('test');
  })

   // DecoratorFactory.getDecorator方法应该返回一个方法装饰器，当调用DecoratorFactory.setMethodCallback，并返回一个属性描述符
   test('DecoratorFactory.getDecorator Should return a method decorator When call DecoratorFactory.setMethodCallback and return a PropertyDescriptor', () => {
    function MethodDecoratorTest() {
      return new DecoratorFactory()
        .setMethodCallback((target, key, descriptor, functionDes) => {
          return {
            enumerable: true,
            configurable: true,
            writable: false,
            value: () => {
              return descriptor.value?.() + '2';
            }
          } as PropertyDescriptor;
        })
        .getDecorator();
    }

    class Test44 {
      @MethodDecoratorTest()
      test() {
        return '1';
      }
    }

    const test44 = new Test44();
    expect(test44.test()).toEqual('12');
  })


})
