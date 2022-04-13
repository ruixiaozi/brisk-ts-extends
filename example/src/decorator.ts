import { DecoratorFactory } from 'brisk-ts-extends/decorator'

export function Test() {
  return new DecoratorFactory()
    .setParamCallback((target, key, index, paramName) => {
      const paramtypes = Reflect.getMetadata('design:paramtypes', target, key);
      console.log(target);
      console.log(key);
      console.log(index);
      console.log(paramName);
      console.log(paramtypes);
    })
    .getDecorator();
}


export function TestFun() {
  return new DecoratorFactory()
    .setMethodCallback((target, key, descriptor) => {
      const paramtypes = Reflect.getMetadata('design:paramtypes', target, key);
      console.log(target);
      console.log(key);
      console.log(descriptor);
      console.log(paramtypes);
    })
    .getDecorator();
}
