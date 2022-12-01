import * as ts from 'typescript';
import * as path from 'path';
import { FunctionsDes, PropertiesDes, TypeKind } from '../types';

const briskRuntimeIdenfiy = ts.factory.createIdentifier('__brisk_ts_extends_runtime__');

let runtimePackage = 'brisk-ts-extends/runtime';

let __brisk = false;

function transType(type?: ts.TypeNode): TypeKind | TypeKind[] {
  switch (type?.kind) {
    case ts.SyntaxKind.StringKeyword:
      return 'string';
    case ts.SyntaxKind.NumberKeyword:
      return 'number';
    case ts.SyntaxKind.BooleanKeyword:
      return 'boolean';
    case ts.SyntaxKind.FunctionType:
      return 'function';
    case ts.SyntaxKind.UnionType:
      return (type as ts.UnionTypeNode)?.types?.map((item) => transType(item) as TypeKind);
    case ts.SyntaxKind.TypeReference:
      switch ((type as ts.TypeReferenceNode).typeName.getText()) {
        case 'Function':
          return 'function';
        default:
          return 'any';
      }
    default:
      return 'any';
  }
}

// 创建成员属性节点
function createPropertyNode(properties: PropertiesDes[], context: ts.TransformationContext) {
  return context.factory.createPropertyAssignment(
    context.factory.createIdentifier('properties'),
    context.factory.createArrayLiteralExpression(
      properties.map((item) => {
        const attr = [
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('key'),
            context.factory.createStringLiteral(item.key),
          ),
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('type'),
            Array.isArray(item.type)
              ? context.factory.createArrayLiteralExpression(
                item.type.map((type) => context.factory.createStringLiteral(type)),
                false,
              ) : context.factory.createStringLiteral(item.type),
          ),
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('option'),
            item.option ? context.factory.createTrue() : context.factory.createFalse(),
          ),
        ];
        if (item.default) {
          attr.push(context.factory.createPropertyAssignment(
            context.factory.createIdentifier('default'),
            context.factory.createStringLiteral(item.default),
          ));
        }
        return context.factory.createObjectLiteralExpression(
          attr,
          true,
        );
      }),
      true,
    ),
  );
}

// 创建成员方法节点
function createFunctionNode(functions: FunctionsDes[], context: ts.TransformationContext) {
  return context.factory.createPropertyAssignment(
    context.factory.createIdentifier('functions'),
    context.factory.createArrayLiteralExpression(
      functions.map((item) => context.factory.createObjectLiteralExpression(
        [
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('name'),
            context.factory.createStringLiteral(item.name),
          ),
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('returnType'),
            Array.isArray(item.returnType)
              ? context.factory.createArrayLiteralExpression(
                item.returnType.map((type) => context.factory.createStringLiteral(type)),
                false,
              ) : context.factory.createStringLiteral(item.returnType),
          ),
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('params'),
            context.factory.createArrayLiteralExpression(item.params.map((param) => {
              const attr = [
                context.factory.createPropertyAssignment(
                  context.factory.createIdentifier('key'),
                  context.factory.createStringLiteral(param.key),
                ),
                context.factory.createPropertyAssignment(
                  context.factory.createIdentifier('type'),
                  Array.isArray(param.type)
                    ? context.factory.createArrayLiteralExpression(
                      param.type.map((type) => context.factory.createStringLiteral(type)),
                      false,
                    ) : context.factory.createStringLiteral(param.type),
                ),
                context.factory.createPropertyAssignment(
                  context.factory.createIdentifier('option'),
                  param.option ? context.factory.createTrue() : context.factory.createFalse(),
                ),
              ];
              if (param.default) {
                attr.push(context.factory.createPropertyAssignment(
                  context.factory.createIdentifier('default'),
                  context.factory.createStringLiteral(param.default),
                ));
              }
              return context.factory.createObjectLiteralExpression(
                attr,
                true,
              );
            })),
          ),
        ],
        true,
      )),
      true,
    ),
  );
}

// 创建静态属性节点
function createPropertyStaticNode(propertiesStatic: PropertiesDes[], context: ts.TransformationContext) {
  return context.factory.createPropertyAssignment(
    context.factory.createIdentifier('propertiesStatic'),
    context.factory.createArrayLiteralExpression(
      propertiesStatic.map((item) => {
        const attr = [
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('key'),
            context.factory.createStringLiteral(item.key),
          ),
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('type'),
            Array.isArray(item.type)
              ? context.factory.createArrayLiteralExpression(
                item.type.map((type) => context.factory.createStringLiteral(type)),
                false,
              ) : context.factory.createStringLiteral(item.type),
          ),
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('option'),
            item.option ? context.factory.createTrue() : context.factory.createFalse(),
          ),
        ];
        if (item.default) {
          attr.push(context.factory.createPropertyAssignment(
            context.factory.createIdentifier('default'),
            context.factory.createStringLiteral(item.default),
          ));
        }
        return context.factory.createObjectLiteralExpression(
          attr,
          true,
        );
      }),
      true,
    ),
  );
}

// 创建静态方法节点
function createFunctionStaticNode(functionsStatic: FunctionsDes[], context: ts.TransformationContext) {
  return context.factory.createPropertyAssignment(
    context.factory.createIdentifier('functionsStatic'),
    context.factory.createArrayLiteralExpression(
      functionsStatic.map((item) => context.factory.createObjectLiteralExpression(
        [
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('name'),
            context.factory.createStringLiteral(item.name),
          ),
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('returnType'),
            Array.isArray(item.returnType)
              ? context.factory.createArrayLiteralExpression(
                item.returnType.map((type) => context.factory.createStringLiteral(type)),
                false,
              ) : context.factory.createStringLiteral(item.returnType),
          ),
          context.factory.createPropertyAssignment(
            context.factory.createIdentifier('params'),
            context.factory.createArrayLiteralExpression(item.params.map((param) => {
              const attr = [
                context.factory.createPropertyAssignment(
                  context.factory.createIdentifier('key'),
                  context.factory.createStringLiteral(param.key),
                ),
                context.factory.createPropertyAssignment(
                  context.factory.createIdentifier('type'),
                  Array.isArray(param.type)
                    ? context.factory.createArrayLiteralExpression(
                      param.type.map((type) => context.factory.createStringLiteral(type)),
                      false,
                    ) : context.factory.createStringLiteral(param.type),
                ),
                context.factory.createPropertyAssignment(
                  context.factory.createIdentifier('option'),
                  param.option ? context.factory.createTrue() : context.factory.createFalse(),
                ),
              ];
              if (param.default) {
                attr.push(context.factory.createPropertyAssignment(
                  context.factory.createIdentifier('default'),
                  context.factory.createStringLiteral(param.default),
                ));
              }
              return context.factory.createObjectLiteralExpression(
                attr,
                true,
              );
            })),
          ),
        ],
        true,
      )),
      true,
    ),
  );
}

// 创建父类/父接口节点
function createParentNode(parents: string[], context: ts.TransformationContext) {
  return context.factory.createPropertyAssignment(
    context.factory.createIdentifier('parents'),
    context.factory.createArrayLiteralExpression(
      parents.map((item) => context.factory.createStringLiteral(item)),
      false,
    ),
  );
}

// 创建添加到brisk-runtime的appen方法节点
function createTypeAppendNode(
  context: ts.TransformationContext,
  typeName: string,
  properties: PropertiesDes[],
  functions: FunctionsDes[],
  parents: string[],
  propertiesStatic?: PropertiesDes[],
  functionsStatic?: FunctionsDes[],
) {
  const attrs = [
    // 成员属性
    createPropertyNode(properties, context),
    // 成员方法
    createFunctionNode(functions, context),
    // 扩展
    createParentNode(parents, context),
  ];

  if (propertiesStatic) {
    attrs.push(createPropertyStaticNode(propertiesStatic, context));
  }

  if (functionsStatic) {
    attrs.push(createFunctionStaticNode(functionsStatic, context));
  }

  return context.factory.createExpressionStatement(context.factory.createCallExpression(
    context.factory.createPropertyAccessExpression(
      briskRuntimeIdenfiy,
      context.factory.createIdentifier('append'),
    ),
    undefined,
    [
      // 名称
      context.factory.createStringLiteral(typeName),
      context.factory.createObjectLiteralExpression(
        attrs,
        true,
      ),
    ],
  ));
}

// 访问接口声明
function visitInterface(node: ts.InterfaceDeclaration, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined {
  // 接口名称
  const interfaceName = node.name.getText();
  // 获取到扩展的类型名称列表
  const extendsNames = node.heritageClauses?.find((item) => item.token === ts.SyntaxKind.ExtendsKeyword)?.types
    .map((item) => item.getText()) || [];
  // 成员属性
  const properties = node.members.filter((item) => ts.isPropertySignature(item)).map((item) => ({
    key: item.name!.getText(),
    type: transType((item as ts.PropertySignature).type),
    option: Boolean(item.questionToken),
  }));

  // 成员方法
  const functions = node.members.filter((item) => ts.isMethodSignature(item)).map((item) => ({
    name: item.name!.getText(),
    returnType: transType((item as ts.MethodSignature).type),
    params: (item as ts.MethodSignature).parameters.map((param) => ({
      key: param.name.getText(),
      type: transType(param.type),
      option: Boolean(param.questionToken),
    })),
  }));

  const interfaceNode = createTypeAppendNode(context, interfaceName, properties, functions, extendsNames);
  __brisk = true;
  return interfaceNode;
}

function visitClass(node: ts.ClassDeclaration, program: ts.Program, context: ts.TransformationContext): ts.Node[] | undefined {
  // 类名称
  const className = node.name!.getText();
  // 获取到扩展的类型名称列表
  const extendsNames = node.heritageClauses?.find((item) => item.token === ts.SyntaxKind.ExtendsKeyword)?.types
    .map((item) => item.getText()) || [];
  const implementsNames = node.heritageClauses?.find((item) => item.token === ts.SyntaxKind.ImplementsKeyword)?.types
    .map((item) => item.getText()) || [];

  // 成员属性
  const properties = node.members
    .filter((item) => ts.isPropertyDeclaration(item) && !ts.getModifiers(item)?.some((modify) => modify.kind === ts.SyntaxKind.StaticKeyword))
    .map((item) => ({
      key: item.name!.getText(),
      type: transType((item as ts.PropertyDeclaration).type),
      option: Boolean((item as ts.PropertyDeclaration).questionToken),
      default: (item as ts.PropertyDeclaration).initializer?.getText(),
    }));

  // 成员方法
  const functions = node.members
    .filter((item) => ts.isMethodDeclaration(item) && !ts.getModifiers(item)?.some((modify) => modify.kind === ts.SyntaxKind.StaticKeyword))
    .map((item) => ({
      name: item.name!.getText(),
      returnType: transType((item as ts.MethodDeclaration).type),
      params: (item as ts.MethodDeclaration).parameters.map((param) => ({
        key: param.name.getText(),
        type: transType(param.type),
        option: Boolean(param.questionToken),
        default: param.initializer?.getText(),
      })),
    }));

  // 静态属性
  const propertiesStatic = node.members
    .filter((item) => ts.isPropertyDeclaration(item) && ts.getModifiers(item)?.some((modify) => modify.kind === ts.SyntaxKind.StaticKeyword))
    .map((item) => ({
      key: item.name!.getText(),
      type: transType((item as ts.PropertyDeclaration).type),
      option: Boolean((item as ts.PropertyDeclaration).questionToken),
      default: (item as ts.PropertyDeclaration).initializer?.getText(),
    }));

  // 静态方法
  const functionsStatic = node.members
    .filter((item) => ts.isMethodDeclaration(item) && ts.getModifiers(item)?.some((modify) => modify.kind === ts.SyntaxKind.StaticKeyword))
    .map((item) => ({
      name: item.name!.getText(),
      returnType: transType((item as ts.MethodDeclaration).type),
      params: (item as ts.MethodDeclaration).parameters.map((param) => ({
        key: param.name.getText(),
        type: transType(param.type),
        option: Boolean(param.questionToken),
        default: param.initializer?.getText(),
      })),
    }));

  const classNode = createTypeAppendNode(
    context,
    className,
    properties,
    functions,
    [...extendsNames, ...implementsNames],
    propertiesStatic,
    functionsStatic,
  );
  __brisk = true;
  return [classNode, node];
}

function transIsLike(node: ts.CallExpression, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined {
  const targetLetName = node.arguments?.[0]!.getText();

  const typeName = (node.typeArguments?.[0]! as ts.TypeReferenceNode).typeName.getText();
  __brisk = true;
  return context.factory.createCallExpression(
    context.factory.createPropertyAccessExpression(
      briskRuntimeIdenfiy,
      context.factory.createIdentifier('isLike'),
    ),
    undefined,
    [
      context.factory.createIdentifier(targetLetName),
      context.factory.createStringLiteral(typeName),
    ],
  );
}

function visitNode(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | ts.Node[] | undefined {
  if (ts.isInterfaceDeclaration(node)) {
    return visitInterface(node, program, context);
  }

  if (ts.isClassDeclaration(node)) {
    return visitClass(node, program, context);
  }

  // isLike转换
  if (ts.isCallExpression(node)
    && node.expression.getText() === 'isLike'
    && node.arguments.length === 1
    && node.typeArguments?.length === 1
    && node.typeArguments?.[0]?.kind === ts.SyntaxKind.TypeReference
  ) {
    return transIsLike(node, program, context);
  }

  return ts.visitEachChild(node, (child) => visitNode(child, program, context), context);
}


function visitSourceFile(
  source: ts.SourceFile,
  program: ts.Program,
  context: ts.TransformationContext,
): ts.SourceFile {
  __brisk = false;
  // 返回的是所有子节点
  const nodes = source.statements.map((item) => visitNode(item, program, context) as any)
    .reduce((pre, current) => {
      if (Array.isArray(current)) {
        return pre.concat(current);
      }
      pre.push(current);
      return pre;
    }, []);
  if (__brisk) {
    nodes.unshift(context.factory.createImportDeclaration(
      undefined,
      undefined,
      context.factory.createImportClause(
        false,
        undefined,
        context.factory.createNamespaceImport(briskRuntimeIdenfiy),
      ),
      context.factory.createStringLiteral(runtimePackage),
      undefined,
    ));
  }

  return ts.factory.updateSourceFile(source, nodes);
}

// transformer
export default (program: ts.Program, config?: any) => {
  if (config?.runtimePackage) {
    runtimePackage = path.join(process.cwd(), config?.runtimePackage);
  } else {
    runtimePackage = 'brisk-ts-extends/runtime';
  }
  return {
    before: (ctx: ts.TransformationContext) => (sourceFile: ts.SourceFile) => visitSourceFile(sourceFile, program, ctx),
  };
};
