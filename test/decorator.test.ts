import { DecoratorFactory } from "../src/decorator";
import { get} from '../src/runtime/index';
import { ParamsDes } from "../src/types";


describe('decorator', () => {

  // DecoratorFactory.getDecorator方法应该返回一个类装饰器，当调用DecoratorFactory.setClassCallback后
  test('DecoratorFactory.getDecorator Should return a class decorator When call DecoratorFactory.setClassCallback', () => {
    const singletons: any = {};
    function ClassDecoratorTest() {
      return new DecoratorFactory()
        .setClassCallback((target, targetDes) => {
          singletons[target.name] = {
            instance: new target(),
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
    let methodParams: ParamsDes[] | undefined;
    function MethodDecoratorTest() {
      return new DecoratorFactory()
        .setMethodCallback((target, key, descriptor, params) => {
          if (params) {
            methodParams = params;
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
    expect(methodParams?.[0]?.key).toEqual('param1');
  })


})
