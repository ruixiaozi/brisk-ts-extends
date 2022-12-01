import { append, get, isLike } from '../src/runtime/index';

describe('runtime', () => {

  let consoleWarn = jest.spyOn(console, 'warn');

  beforeEach(() => {
    consoleWarn = jest.spyOn(console, 'warn');
  })

  // append方法当typeName不存在时，能够成功添加当前的类型描述
  test('append Should add a type descript to runtimeTypes When typeName is not exist', () => {
    append('Test1', {
      properties: [
        {
          key: "b",
          type: "string",
          option: false
        }
      ],
      functions: [],
      parents: []
    });
    expect(get('Test1')?.properties?.[0]?.key).toEqual('b');
  })

  // append方法当typeName存在时，能够成功添加当前的类型描述，覆盖之前的描述，并输出警告
  test('append Should replace a type descript to runtimeTypes and warn When typeName is exist', () => {
    append('Test2', {
      properties: [
        {
          key: "b",
          type: "string",
          option: false
        }
      ],
      functions: [],
      parents: []
    });
    append('Test2', {
      properties: [
        {
          key: "c",
          type: "string",
          option: false
        }
      ],
      functions: [],
      parents: []
    });
    expect(get('Test2')?.properties?.[0]?.key).toEqual('c');
    expect(consoleWarn).toHaveBeenCalledWith('Test2 is exist!');
  })

  // isLike方法当typeName无效或者不存在时、或者target不是一个对象，应该返回false
  test('isLike Should return false When typeName is not valid or typeName is not exist or target is not a object', () => {
    append('Test3', {
      properties: [
        {
          key: "b",
          type: "string",
          option: false
        }
      ],
      functions: [],
      parents: []
    });
    const obj = {
      b: '1'
    };
    expect(isLike(obj, '')).toEqual(false);
    expect(isLike(obj)).toEqual(false);
    expect(isLike(obj, 'TestNull')).toEqual(false);
    expect(isLike(1, 'Test3')).toEqual(false);
  })

  // isLike方法当类型描述中，属性是可选属性，可以不用赋值
  test('isLike Should return true When property is option and it is undefined or it is right type', () => {
    append('Test4', {
      properties: [
        {
          key: "b",
          type: "string",
          option: true
        }
      ],
      functions: [],
      parents: []
    });
    const obj = {};
    const objHasValue = {
      b: '111'
    };
    expect(isLike(obj, 'Test4')).toEqual(true);
    expect(isLike(objHasValue, 'Test4')).toEqual(true);
  })

  // isLike方法当类型与实际类型不符时，应该返回false
  test('isLike Should return false When property is not right type', () => {
    append('Test5', {
      properties: [
        {
          key: "b",
          type: "string",
          option: false
        }
      ],
      functions: [],
      parents: []
    });
    const obj = {
      b: 1
    };
    expect(isLike(obj, 'Test5')).toEqual(false);
  })

  // isLike方法当类型为联合类型，且实际类型满足，应该返回true
  test('isLike Should return true When property is union type and it is right type', () => {
    append('Test6', {
      properties: [
        {
          key: "b",
          type: ["string", "number"],
          option: false
        }
      ],
      functions: [],
      parents: []
    });
    const obj = {
      b: 1
    };
    expect(isLike(obj, 'Test6')).toEqual(true);
  })

  // isLike方法当类型为联合类型，且与实际类型不符时，应该返回false
  test('isLike Should return false When property is union type and it is not right type', () => {
    append('Test7', {
      properties: [
        {
          key: "b",
          type: ["string", "number"],
          option: false
        }
      ],
      functions: [],
      parents: []
    });
    const obj = {
      b: true
    };
    expect(isLike(obj, 'Test7')).toEqual(false);
  })

  // isLike方法当类有继承或者实现类时，应该递归比较
  test('isLike Should return recursion compare When type extend or implement parent type', () => {
    append('Test8', {
      properties: [
        {
          key: "b",
          type: ["string", "number"],
          option: false
        }
      ],
      functions: [],
      parents: []
    });
    append('Test9', {
      properties: [
        {
          key: "c",
          type: "boolean",
          option: false
        }
      ],
      functions: [],
      parents: ["Test8"]
    });
    const obj = {
      b: 1,
      c: true,
    };
    const objFalse = {
      c: true,
    };
    expect(isLike(obj, 'Test9')).toEqual(true);
    expect(isLike(objFalse, 'Test9')).toEqual(false);
  })

})