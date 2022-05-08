import * as fs from 'fs';
import * as path from 'path';

const __root = process.cwd();
export interface RuntimeAttribute {
  name: string;
  typeNames: string[];
  isStatic?: boolean;
}

export interface RuntimeMethod {
  name: string;
  isStatic: boolean;
  params: RuntimeAttribute[];
  returnTypeNames: string[];
}


export interface RuntimeType {
  name: string;
  properties?: RuntimeAttribute[];
  methods?: RuntimeMethod[];
}

interface RuntimeTypes {
  [name: string]: RuntimeType;
}


export class RuntimeTypeContainer {

  static readonly FILE = path.join(__root, './node_modules/brisk-ts-extends/.brisk-ts-extend-runtime.json');

  static #runtimeTypes: RuntimeTypes = {};

  static put(runtimeType: RuntimeType) {
    this.#runtimeTypes[runtimeType.name] = runtimeType;
  }

  static get(name: string): RuntimeType | undefined {
    return this.#runtimeTypes[name];
  }

  static writeToFile() {
    fs.writeFileSync(this.FILE, JSON.stringify(this.#runtimeTypes));
  }

  static readFromFile() {
    if (fs.existsSync(this.FILE)) {
      this.#runtimeTypes = require(this.FILE);
    }
  }

}

RuntimeTypeContainer.readFromFile();
