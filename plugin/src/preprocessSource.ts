import path from "path"
import fs from "fs"

import type { PreprocessSourceArgs, GatsbyNode, Page } from "gatsby";
import traverse from "@babel/traverse"
import { NodePath } from "@babel/core"
import { JSXOpeningElement } from "@babel/types"
import { parse, ParserOptions } from "@babel/parser"
import babel from "@babel/core"
import { getAttributeValues } from "babel-jsx-utils"
import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file";

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

function getBabelParserOptions(filePath: string): ParserOptions {
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
const extractProps = (
  ast: babel.types.File,
  filename: string,
  onError?: (prop: string, nodePath: NodePath) => void
): string[] => {
  const props = [];

  traverse(ast, {
    JSXOpeningElement(nodePath: NodePath<JSXOpeningElement>) {
      // Is this a MaterialSymbol?
      let name = nodePath.get("name");
      let nameReferencesImport = nodePath.get("name").referencesImport("gatsby-plugin-material-symbols", "MaterialSymbol");
      if (
        !nodePath
          .get("name")
          .referencesImport("gatsby-plugin-material-symbols", "MaterialSymbol")
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

const MATERIALSYMBOL_PROPS = new Set([
  "symbol",
  "fill",
  "weight",
  "grade",
  "size",
  "symbolStyle",
  "className",
  "style",
  "as",
  "onClick"
]);

export let staticAnalysisCache = {};

export const preprocessSource: GatsbyNode["preprocessSource"] = async (
{
  filename,
  contents,
  cache,
  reporter,
  store,
  getNode,
  actions: { deletePage, createPage }
}: PreprocessSourceArgs, pluginOptions) => {
  if (
    !contents.includes("MaterialSymbol") ||
    ![`.jsx`, `.tsx`].includes(path.extname(filename))
  ) {
    return
  }

  // If we are in develop mode, we skip most of the optimizations we do in build mode
  if (store.getState().program._[0] == "develop") {
    const url = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200&family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200";
    const filename = await fetchRemoteFile({url, cache, ext: ".css", name: "material-symbols"});

    const cacheDir = path.join(__dirname, "..", ".cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }
    fs.copyFileSync(filename, path.join(cacheDir, "material-symbols.css"));
    return;
  } else {
    const ast = babelParseToAst(contents, filename);
  
    const symbols = extractProps(ast, filename);
  
    // We don't check if the icons are already in the cache
    // because we want to remove them from the cache if they are not used anymore
    staticAnalysisCache[filename as string] = symbols;
  
    pluginOptions.verbose
    ? reporter.info(`gatsby-plugin-material-symbols: Statically analyzed ${filename} for Material Symbols, found ${symbols.length} symbols`)
    : reporter.verbose(`gatsby-plugin-material-symbols: Statically analyzed ${filename} for Material Symbols, found ${symbols.length} symbols`);
  }
}