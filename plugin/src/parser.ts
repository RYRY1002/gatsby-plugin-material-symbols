import traverse from "@babel/traverse"
import { NodePath } from "@babel/core"
import { JSXOpeningElement } from "@babel/types"
import { parse, ParserOptions } from "@babel/parser"
import babel from "@babel/core"
import { getAttributeValues } from "babel-jsx-utils"

const PARSER_OPTIONS: ParserOptions = {
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  sourceType: `unambiguous`,
  plugins: [
    `jsx`,
    `flow`,
    `doExpressions`,
    `objectRestSpread`,
    [
      `decorators`,
      {
        decoratorsBeforeExport: true,
      },
    ],
    `classProperties`,
    `classPrivateProperties`,
    `classPrivateMethods`,
    `exportDefaultFrom`,
    `exportNamespaceFrom`,
    `asyncGenerators`,
    `functionBind`,
    `functionSent`,
    `dynamicImport`,
    `numericSeparator`,
    `optionalChaining`,
    `importMeta`,
    `bigInt`,
    `optionalCatchBinding`,
    `throwExpressions`,
    [
      `pipelineOperator`,
      {
        proposal: `minimal`,
      },
    ],
    `nullishCoalescingOperator`,
  ],
};

export function getBabelParserOptions(filePath: string): ParserOptions {
  // Flow and TypeScript plugins can't be enabled simultaneously
  if (/\.tsx?/.test(filePath)) {
    const { plugins } = PARSER_OPTIONS
    return {
      ...PARSER_OPTIONS,
      plugins: (plugins || []).map(plugin =>
        plugin === `flow` ? `typescript` : plugin
      ),
    }
  }
  return PARSER_OPTIONS
};

export function babelParseToAst(
  contents: string,
  filePath: string
): babel.types.File {
  return parse(contents, getBabelParserOptions(filePath))
};

/**
 * Traverses the parsed source, looking for MaterialSymbol components.
 * Extracts and returns the props from any that are found
 */
export const extractProps = (
  ast: babel.types.File,
  filename: string,
  onError?: (prop: string, nodePath: NodePath) => void
): string[] => {
  const props = [];

  traverse(ast, {
    JSXOpeningElement(nodePath: NodePath<JSXOpeningElement>) {
      // Is this a MaterialSymbol?
      let name = nodePath.get("name");
      let nameReferencesImport = nodePath.get("name").referencesImport("plugin", "MaterialSymbol");
      if (
        !nodePath
          .get("name")
          .referencesImport("plugin", "MaterialSymbol")
      ) {
        return;
      };
      
      const prop = ((nodePath) => {
        let props = getAttributeValues(nodePath, onError, MATERIALSYMBOL_PROPS);
        
        if (props.icon && typeof props.icon === "string") {
          props.icon = props.icon.toLowerCase();
        }
        if (props.symbolStyle && typeof props.symbolStyle === "string") {
          props.symbolStyle = props.symbolStyle.toLowerCase();
        } else {
          props.symbolStyle = "outlined";
        }
        return props;
      })(nodePath);

      props.push(prop);
    },
  });
  return props;
};

export const MATERIALSYMBOL_PROPS = new Set([
  "icon",
  "fill",
  "weight",
  "grade",
  "size",
  "symbolStyle",
  "className",
  "style",
  "as",
  "onClick"
])