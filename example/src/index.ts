import 'reflect-metadata';
import { Test, TestFun } from './decorator';


class T {
  @TestFun()
  test(@Test() a: number, @Test() b: string) {
    console.log('test');
  }
}

new T().test(1, '1');
