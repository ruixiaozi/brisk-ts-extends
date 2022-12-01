import { DecoratorFactory, isLike } from "brisk-ts-extends";
import * as runtime from "brisk-ts-extends/runtime";

interface SuperInterface {
  b: string;
}

export interface SubInterface extends SuperInterface {
  a: string;
  aaaa?: string | number;

  aTest(param: number): string;

  bTest(param?: string): number;

  cTest(): void;
}

export class SuperClass implements SuperInterface {
  static test: String = '123';
  static readonly readOnlyTest: number = 1;

  b: string = '222';

  test(arg1: string) {
    return this.b;
  }

  static staticTest(arg1: number = 1): void {
    console.log(1);
  }
}

export class Atest extends SuperClass implements SubInterface {
  a: string = '123';

  aaaa?: string | number | undefined;

  aTest(param: number): string {
    throw new Error("Method not implemented.");
  }

  bTest(param?: string | undefined): number {
    throw new Error("Method not implemented.");
  }

  cTest(): void {
    throw new Error("Method not implemented.");
  }

  b: string = '123';
}

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

console.log(singletons['Test1']?.des);

const aTest = new Atest();
console.log(aTest);

const superInterfaceInstance: any = {
  b: '123',
};

console.log(superInterfaceInstance);

console.log(runtime.get('SuperInterface'));

console.log(isLike<SuperInterface>(superInterfaceInstance));
console.log(isLike<Atest>(aTest));
(aTest as any).b = undefined;
console.log(isLike<Atest>(aTest));
