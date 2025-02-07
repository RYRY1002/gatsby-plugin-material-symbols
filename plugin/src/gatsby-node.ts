import path from "path"
import fs from "fs"

import type { PreprocessSourceArgs, CreatePageArgs, GatsbyNode, Page } from "gatsby";
import { babelParseToAst, extractProps } from "./parser";
import { NodePath } from "@babel/traverse";

import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file";

import type { MaterialSymbolProps } from "./component"

const extensions: Array<string> = [`.js`, `.jsx`, `.tsx`];
let pathComponent: Record<string, string> = {};

export const onCreatePage: GatsbyNode["onCreatePage"] = async ({ page, actions, cache, reporter }, pluginOptions) => {
  pathComponent[page.component] = page.path;
}

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
    !extensions.includes(path.extname(filename))
  ) {
    return
  }
  let getState = store.getState(); // TODO
  const ast = babelParseToAst(contents, filename);
  
  const symbols = extractProps(ast, filename);
  
  let cachedIcons = await cache.get("gatsby-plugin-material-symbols");
  if (cachedIcons === undefined) {
    cachedIcons = {};
  }

  // We don't check if the icons are already in the cache
  // because we want to remove them from the cache if they are not used anymore
  cachedIcons[filename as string] = symbols;

  await cache.set("gatsby-plugin-material-symbols", cachedIcons);

  const node = getNode(`SitePage ${pathComponent[filename]}`);
  deletePage(node as unknown as Page);
  createPage({
    ...node as unknown as Page,
    context: {
      MaterialSymbols: symbols
    }
  });

  reporter.info(`gatsby-plugin-material-symbols: ${filename} processed`);
}

export const onPreBuild: GatsbyNode["onPreBuild"] = async ({ reporter, cache, actions: {} }) => {
  // Build CSS url
  const cachedIcons = await cache.get("gatsby-plugin-material-symbols")
  const symbolsObject = cachedIcons["/workspaces/gatsby-plugin-material-symbols/site/src/pages/index.tsx"];

  const symbols = symbolsObject.map(symbol => symbol.icon as string);
  const symbolStyles = symbolsObject.filter(symbol => symbol.symbolStyle).map(symbol => symbol.symbolStyle as string);

  let url: string = "https://fonts.googleapis.com/css2?family=";

  // Subset font to only include the variable axes that are used
  function variableFontSubset(style: MaterialSymbolProps["symbolStyle"]) {
    let url: string = "";
    /*const icons = symbols
      .filter(symbol => symbol.symbolStyle === style)
      .map(symbol => symbol.icon as string);*/
    const fills = symbols
      .filter(symbol => symbol.symbolStyle === style && symbol.fill)
      .map(symbol => symbol.fill as boolean);
    const weights = symbols
      .filter(symbol => symbol.symbolStyle === style && symbol.weight)
      .map(symbol => symbol.weight as number);
    const grades = symbols
      .filter(symbol => symbol.symbolStyle === style && symbol.grade)
      .map(symbol => symbol.grade as number);
    const sizes = symbols
      .filter(symbol => symbol.symbolStyle === style && symbol.size)
      .map(symbol => symbol.size as number);
    if (fills?.length > 0 || weights?.length > 0 || grades?.length > 0 || sizes?.length > 0) {
      const doFills = fills.length > 0;
      const doWeights = weights.length > 0;
      const doGrades = grades.length > 0;
      const doSizes = sizes.length > 0;
  
      function smallestLargestValues(values: number[]) {
        return `${Math.min(...values)}..${Math.max(...values)}`;
      };

      url += ":";
  
      // Specify which properties are being set
      let properties: string[] = [];
      doFills && properties.push("FILL");
      doGrades && properties.push("GRAD");
      doSizes && properties.push("opsz");
      doWeights && properties.push("wght");
      url += properties.join(",");
  
      url += "@";
  
      const hasTrueFill = fills.some(fill => fill === true);
      const trueFillsOnly = fills.every(fill => fill === true);
      // Specify the values of the properties
      let values: string[] = [];
      doFills && (() => {
        if (trueFillsOnly) {
          values.push("1");
        } else if (hasTrueFill) {
          values.push("1");
        }
      })();
      doGrades && (() => {
        if (grades.length === 1) {
          if (grades[0] > 0) {
            values.push(`0..${grades[0]}`);
          } else if (grades[0] < 0) {
            values.push(`${grades[0]}..0`);
          }
        } else {
          return smallestLargestValues(grades);
        }
      })();
      doSizes && (() => {
        if (sizes.length === 1) {
          if (sizes[0] > 24) {
            values.push(`24..${sizes[0]}`);
          } else if (sizes[0] < 24) {
            values.push(`${sizes[0]}..24`);
          }
        } else {
          return smallestLargestValues(sizes);
        }
      })();
      doWeights && (() => {
        if (weights.length === 1) {
          if (weights[0] > 400) {
            values.push(`400..${weights[0]}`);
          } else if (weights[0] < 400) {
            values.push(`${weights[0]}..400`);
          }
        } else {
          values.push(smallestLargestValues(weights));
        }
      })();
      url += values.join(",");
    }

    return url;
  };

  let families: string[] = [];
  symbolStyles.includes("outlined") && families.push(`Material+Symbols+Outlined${variableFontSubset("outlined")}`);
  symbolStyles.includes("rounded") && families.push(`Material+Symbols+Rounded${variableFontSubset("rounded")}`);
  symbolStyles.includes("sharp") && families.push(`Material+Symbols+Sharp${variableFontSubset("sharp")}`);
  url += families.join("&family=");

  symbols.sort(function (a, b) {
    return a.length - b.length;
  });
  url += "&icon_names=" + symbols.join(",");

  // Subset the font to only include the icons that are used
  url += "&display=block";

  // Fetch the remote CSS
  const filename = await fetchRemoteFile({ url, cache, ext: ".css", name: "material-symbols" });
  let cssFile
  try {
    cssFile = fs.readFileSync(filename).toString();
  } catch (error) {
    reporter.error(`gatsby-plugin-material-symbols: ${error}`);
  }

  // Convert all font urls to an embedded base64 font
  const fontUrls: string[] = cssFile.match(/(?<=url\()[^)]+/g);
  if (fontUrls) {
    for (const fontUrl of fontUrls) {
      const fontFilename = await fetchRemoteFile({ url: fontUrl, cache, ext: ".woff2", name: "material-symbols" });
      const base64Font = fs.readFileSync(fontFilename).toString("base64");
      cssFile = cssFile.replace(fontUrl, `data:font/woff2;base64,${base64Font}`);
    }
  }

  // set font-size to inherit
  cssFile = cssFile.replace(/(?<=font-size: )24px(?=;)/g, "inherit");
  
  // Write the new CSS to the cache
  fs.writeFileSync(filename, cssFile);
  const cacheDir = path.join(__dirname, "..", ".cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  const cacheFilePath = path.join(cacheDir, "material-symbols.css");
  fs.writeFileSync(cacheFilePath, cssFile);

  cssFile = filename;
  reporter.info(`gatsby-plugin-material-symbols: CSS file downloaded to ${filename}`);
}

export const pluginOptionsSchema: GatsbyNode["pluginOptionsSchema"] = ({ Joi }) => {
  return Joi.object({
    perPage: Joi
      .boolean()
      .default(false)
      .description("When true, request a font file that only has the icons used on the current page. When false, request the same font file on all pages with every icon used across the entire site."),
    extraIcons: Joi
      .object()
      .default({})
      .description("A list of additional icons to include. You can optionally include which page the icons are used on if you have perPage enabled. This is especially useful if you are changing the icon at runtime which will not be caught during static analysis."),
    verbose: Joi
      .boolean()
      .default(false)
      .description("When true, writes information to the console useful for debugging.")
  })
}

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions: { setWebpackConfig }}) => {
  setWebpackConfig({
    resolve: {
      fallback: {
        fs: false,
        tls: false,
        net: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
        util: false,
        assert: false,
        os: false,
        constants: false,
        url: false,
        module: false
      }
    }
  })
}
