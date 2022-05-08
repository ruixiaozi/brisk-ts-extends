export interface RuntimeAttribute {
  name: string;
  type: RuntimeType;
}

export interface RuntimeMethod {
  name: string;
  params: RuntimeAttribute[];
  return: RuntimeAttribute[];
}


export interface RuntimeType {
  name: string;
  properties?: RuntimeAttribute[];
  methods?: RuntimeMethod[];
}


export class RuntimeTypeContainer {

  static #runtimeTypes: Map<string, RuntimeType> = new Map<string, RuntimeType>();

  static put(runtimeType: RuntimeType) {
    this.#runtimeTypes.set(runtimeType.name, runtimeType);
  }

  static get(name: string): RuntimeType | undefined {
    return this.#runtimeTypes.get(name);
  }

}
