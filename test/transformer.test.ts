import * as ts from 'ttypescript';

// 因为当前模块是通过ttsc的方式收集依赖，存在覆盖率统计第一次不正确，可多次运行统计
describe('transformer', () => {
  const tsconfig = {
    "compilerOptions": {
      "target": ts.ScriptTarget.ES2021, // require node >= 12
      "module": ts.ModuleKind.CommonJS,
      "declaration": true,
      "outDir": "./",
      "strict": true,
      "esModuleInterop": true,
      "pretty": true,
      "experimentalDecorators": true,
      "plugins": [
        {
          "transform": "./src/transformer/index.ts",
        }
      ] as any,
    },
  };

  // transformer，当自定义一个runtimePackage路径时，应该转换正确的引入路径
  test('transformer Should transform to runtimePackage path When tsconfig has a runtimePackage', () => {
    const myTsConfig = {
      "compilerOptions": {
        "target": ts.ScriptTarget.ES2021, // require node >= 12
        "module": ts.ModuleKind.CommonJS,
        "declaration": true,
        "outDir": "./",
        "strict": true,
        "esModuleInterop": true,
        "pretty": true,
        "experimentalDecorators": true,
        "plugins": [
          {
            "transform": "./src/transformer/index.ts",
            "runtimePackage": "./src/runtime"
          }
        ] as any
      },
    };
    const res = ts.transpileModule(`
      interface SuperInterface {
        b: string;
      }
    `, myTsConfig);
    expect(res.outputText).toMatch(/const __brisk_ts_extends_runtime__ = __importStar\(require\(.*src.*runtime\"\)\)\;/);
  })

  // transformer，应该转换为一个append节点，当ts中有一个接口声明
  test('transformer Should transform to append node When has a interface declare', () => {
    const res = ts.transpileModule(`
      interface SuperInterface {
        b: boolean;
        bb: () => void;
        bbb: Function;
      }
      export interface SubInterface extends SuperInterface {
        a: string;
        aaaa?: string | number;

        aTest(param: number): string;

        bTest(param?: string): number;

        cTest(): void;
      }
    `, tsconfig);
    expect(res.outputText).toContain('const __brisk_ts_extends_runtime__ = __importStar(require("brisk-ts-extends/runtime"));');
    expect(res.outputText).toContain('__brisk_ts_extends_runtime__.append("SuperInterface", {\r\n' +
    '    properties: [\r\n' +
    '        {\r\n' +
    '            key: "b",\r\n' +
    '            type: "boolean",\r\n' +
    '            option: false\r\n' +
    '        },\r\n' +
    '        {\r\n' +
    '            key: "bb",\r\n' +
    '            type: "function",\r\n' +
    '            option: false\r\n' +
    '        },\r\n' +
    '        {\r\n' +
    '            key: "bbb",\r\n' +
    '            type: "function",\r\n' +
    '            option: false\r\n' +
    '        }\r\n' +
    '    ],\r\n' +
    '    functions: [],\r\n' +
    '    parents: []\r\n' +
    '});');
    expect(res.outputText).toContain('__brisk_ts_extends_runtime__.append("SubInterface", {\r\n' +
    '    properties: [\r\n' +
    '        {\r\n' +
    '            key: "a",\r\n' +
    '            type: "string",\r\n' +
    '            option: false\r\n' +
    '        },\r\n' +
    '        {\r\n' +
    '            key: "aaaa",\r\n' +
    '            type: ["string", "number"],\r\n' +
    '            option: true\r\n' +
    '        }\r\n' +
    '    ],\r\n' +
    '    functions: [\r\n' +
    '        {\r\n' +
    '            name: "aTest",\r\n' +
    '            returnType: "string",\r\n' +
    '            params: [{\r\n' +
    '                    key: "param",\r\n' +
    '                    type: "number",\r\n' +
    '                    option: false\r\n' +
    '                }]\r\n' +
    '        },\r\n' +
    '        {\r\n' +
    '            name: "bTest",\r\n' +
    '            returnType: "number",\r\n' +
    '            params: [{\r\n' +
    '                    key: "param",\r\n' +
    '                    type: "string",\r\n' +
    '                    option: true\r\n' +
    '                }]\r\n' +
    '        },\r\n' +
    '        {\r\n' +
    '            name: "cTest",\r\n' +
    '            returnType: "any",\r\n' +
    '            params: []\r\n' +
    '        }\r\n' +
    '    ],\r\n' +
    '    parents: ["SuperInterface"]\r\n' +
    '});');
  })

  // transformer，应该转换为一个append节点，当ts中有一个类声明，且无继承，无实现
  test('transformer Should transform to append node When has a class declare and no extends and no implement', () => {
    const res = ts.transpileModule(`
      class SuperClass {
        test(arg1?: string, arg2: number = 1): void {
          console.log(1);
        }
      }
    `, tsconfig);
    console.log(res);
    expect(res.outputText).toContain('const __brisk_ts_extends_runtime__ = __importStar(require("brisk-ts-extends/runtime"));');
    expect(res.outputText).toContain('__brisk_ts_extends_runtime__.append("SuperClass", {\r\n' +
    '    properties: [],\r\n' +
    '    functions: [\r\n' +
    '        {\r\n' +
    '            name: "test",\r\n' +
    '            returnType: "any",\r\n' +
    '            params: [{\r\n' +
    '                    key: "arg1",\r\n' +
    '                    type: "string",\r\n' +
    '                    option: true\r\n' +
    '                }, {\r\n' +
    '                    key: "arg2",\r\n' +
    '                    type: "number",\r\n' +
    '                    option: false,\r\n' +
    '                    default: "1"\r\n' +
    '                }]\r\n' +
    '        }\r\n' +
    '    ],\r\n' +
    '    parents: [],\r\n' +
    '    propertiesStatic: [],\r\n' +
    '    functionsStatic: []\r\n' +
    '});');
  })


  // transformer，应该转换为一个append节点，当ts中有一个类声明
  test('transformer Should transform to append node When has a class declare', () => {
    const res = ts.transpileModule(`
      class SuperClass implements SuperInterface {
        static test: string = '123';
        static readonly readOnlyTest: number = 1;

        b: string = '222';

        test(arg1: string) {
          return this.b;
        }

        static staticTest(arg1: number = 1): void {
          console.log(1);
        }
      }

      class SubClass extends SuperClass implements SubInterface {
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
    `, tsconfig);
    expect(res.outputText).toContain('const __brisk_ts_extends_runtime__ = __importStar(require("brisk-ts-extends/runtime"));');
    expect(res.outputText).toContain('__brisk_ts_extends_runtime__.append("SuperClass", {\r\n' +
    '    properties: [\r\n' +
    '        {\r\n' +
    '            key: "b",\r\n' +
    '            type: "string",\r\n' +
    '            option: false,\r\n' +
    `            default: "'222'"\r\n` +
    '        }\r\n' +
    '    ],\r\n' +
    '    functions: [\r\n' +
    '        {\r\n' +
    '            name: "test",\r\n' +
    '            returnType: "any",\r\n' +
    '            params: [{\r\n' +
    '                    key: "arg1",\r\n' +
    '                    type: "string",\r\n' +
    '                    option: false\r\n' +
    '                }]\r\n' +
    '        }\r\n' +
    '    ],\r\n' +
    '    parents: ["SuperInterface"],\r\n' +
    '    propertiesStatic: [\r\n' +
    '        {\r\n' +
    '            key: "test",\r\n' +
    '            type: "string",\r\n' +
    '            option: false,\r\n' +
    `            default: "'123'"\r\n` +
    '        },\r\n' +
    '        {\r\n' +
    '            key: "readOnlyTest",\r\n' +
    '            type: "number",\r\n' +
    '            option: false,\r\n' +
    '            default: "1"\r\n' +
    '        }\r\n' +
    '    ],\r\n' +
    '    functionsStatic: [\r\n' +
    '        {\r\n' +
    '            name: "staticTest",\r\n' +
    '            returnType: "any",\r\n' +
    '            params: [{\r\n' +
    '                    key: "arg1",\r\n' +
    '                    type: "number",\r\n' +
    '                    option: false,\r\n' +
    '                    default: "1"\r\n' +
    '                }]\r\n' +
    '        }\r\n' +
    '    ]\r\n' +
    '});');
    expect(res.outputText).toContain('__brisk_ts_extends_runtime__.append("SubClass", {\r\n' +
    '    properties: [\r\n' +
    '        {\r\n' +
    '            key: "a",\r\n' +
    '            type: "string",\r\n' +
    '            option: false,\r\n' +
    `            default: "'123'"\r\n` +
    '        },\r\n' +
    '        {\r\n' +
    '            key: "aaaa",\r\n' +
    '            type: ["string", "number", "any"],\r\n' +
    '            option: true\r\n' +
    '        },\r\n' +
    '        {\r\n' +
    '            key: "b",\r\n' +
    '            type: "string",\r\n' +
    '            option: false,\r\n' +
    `            default: "'123'"\r\n` +
    '        }\r\n' +
    '    ],\r\n' +
    '    functions: [\r\n' +
    '        {\r\n' +
    '            name: "aTest",\r\n' +
    '            returnType: "string",\r\n' +
    '            params: [{\r\n' +
    '                    key: "param",\r\n' +
    '                    type: "number",\r\n' +
    '                    option: false\r\n' +
    '                }]\r\n' +
    '        },\r\n' +
    '        {\r\n' +
    '            name: "bTest",\r\n' +
    '            returnType: "number",\r\n' +
    '            params: [{\r\n' +
    '                    key: "param",\r\n' +
    '                    type: ["string", "any"],\r\n' +
    '                    option: true\r\n' +
    '                }]\r\n' +
    '        },\r\n' +
    '        {\r\n' +
    '            name: "cTest",\r\n' +
    '            returnType: "any",\r\n' +
    '            params: []\r\n' +
    '        }\r\n' +
    '    ],\r\n' +
    '    parents: ["SuperClass", "SubInterface"],\r\n' +
    '    propertiesStatic: [],\r\n' +
    '    functionsStatic: []\r\n' +
    '});');
  })

  // transformer，应该转换为一个isLike具有2个参数的方法调用，当ts中有一个isLike调用，并且只有一个参数和一个泛型，并且泛型为类型引用
  test('transformer Should transform to has two params isLike call When isLike has one param and one type declare', () => {
    const res = ts.transpileModule(`
      isLike<SuperInterface>(superInterfaceInstance)
    `, tsconfig);
    expect(res.outputText).toContain('const __brisk_ts_extends_runtime__ = __importStar(require("brisk-ts-extends/runtime"));');
    expect(res.outputText).toContain('__brisk_ts_extends_runtime__.isLike(superInterfaceInstance, "SuperInterface");',)
  })

  // transformer，应该不转换，当有一个匿名的类声明
  test('transformer Should not transform When has a anonymity class declare', () => {
    const res = ts.transpileModule(`
      class {
        test: string = '123';
      }
    `, tsconfig);
    expect(res.outputText).not.toContain('const __brisk_ts_extends_runtime__ = __importStar(require("brisk-ts-extends/runtime"));');
  })

})
