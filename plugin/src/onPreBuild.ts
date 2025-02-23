import path from "path"
import fs from "fs"

import type { GatsbyNode } from "gatsby";

import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file";

import type { MaterialSymbolProps } from "./component"

import type { pluginOptions as PluginOptions } from "./gatsby-node";

import { staticAnalysisCache } from "./preprocessSource";

// @ts-ignore
export const onPreBuild: GatsbyNode["onPreBuild"] = async ({ reporter, cache }, PluginOptions: PluginOptions) => {
  const pluginOptions = PluginOptions as PluginOptions;

  // Build CSS url
  const symbolsObject = Object.values(staticAnalysisCache).flat() as any[];

  const symbols = symbolsObject.map(symbol => symbol.icon as string);
  let symbolStyles = symbolsObject.filter(symbol => symbol.symbolStyle).map(symbol => symbol.symbolStyle as string);
  if (pluginOptions.extraStyles) {
    if (Array.isArray(pluginOptions.extraStyles)) {
      pluginOptions.extraStyles.forEach((style: string) => {
        if (!symbolStyles.includes(style)) {
          symbolStyles.push(style);
        }
      });
    } else if (typeof pluginOptions.extraStyles === "object") {
      pluginOptions.extraStyles.outlined && symbolStyles.push("outlined");
      pluginOptions.extraStyles.rounded && symbolStyles.push("rounded");
      pluginOptions.extraStyles.sharp && symbolStyles.push("sharp");
    }
  }
  symbolStyles = [...new Set(symbolStyles)];

  let url: string = "https://fonts.googleapis.com/css2?family=";

  // Subset font to only include the variable axes that are used
  function variableFontSubset(style: MaterialSymbolProps["symbolStyle"]) {
    let url: string = "";
    /*const icons = symbols
      .filter(symbol => symbol.symbolStyle === style)
      .map(symbol => symbol.icon as string);*/
    let fills = symbolsObject
      .filter(symbol => symbol.symbolStyle === style && symbol.fill)
      .map(symbol => symbol.fill as boolean);
    let weights = symbolsObject
      .filter(symbol => symbol.symbolStyle === style && symbol.weight)
      .map(symbol => symbol.weight as number);
    let grades = symbolsObject
      .filter(symbol => symbol.symbolStyle === style && symbol.grade)
      .map(symbol => symbol.grade as number);
    let sizes = symbolsObject
      .filter(symbol => symbol.symbolStyle === style && symbol.size)
      .map(symbol => symbol.size as number);

    if (pluginOptions.sizeRange) {
      sizes = sizes.concat(pluginOptions.sizeRange as number[]);
    }
    if (pluginOptions.weightRange) {
      weights = weights.concat(pluginOptions.weightRange as number[]);
    }
    if (pluginOptions.includeFill) {
      fills = fills.concat(true);
    }
    if (pluginOptions.gradeRange) {
      grades = grades.concat(pluginOptions.gradeRange as number[]);
    }

    if (sizes?.length > 0 || weights?.length > 0 || fills?.length > 0 || grades?.length > 0) {
      const doSizes = sizes.length > 0;
      const doWeights = weights.length > 0;
      const doFills = fills.length > 0;
      const doGrades = grades.length > 0;
  
      function smallestLargestValues(values: number[], min?: number, max?: number) {
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        return `${min ? Math.max(min, minValue) : minValue}..${max ? Math.min(max, maxValue) : maxValue}`;
      };

      url += ":";
  
      // Specify which properties are being set
      let properties: string[] = [];
      doSizes && properties.push("opsz");
      doWeights && properties.push("wght");
      doFills && properties.push("FILL");
      doGrades && properties.push("GRAD");
      url += properties.join(",");
  
      url += "@";
  
      const hasTrueFill = fills.some(fill => fill === true);
      const trueFillsOnly = fills.every(fill => fill === true);
      // Specify the values of the properties
      let values: string[] = [];
      doSizes && (() => {
        if (sizes.length === 1) {
          if (sizes[0] > 24) {
            values.push(`24..${sizes[0]}`);
          } else if (sizes[0] < 24) {
            values.push(`${sizes[0]}..24`);
          }
        } else if (sizes.every(size => size === sizes[0])) {
          values.push(`${sizes[0]}`);
        } else {
          values.push(smallestLargestValues(sizes, 5, 1200));
        }
      })();
      doWeights && (() => {
        if (weights.length === 1) {
          if (weights[0] > 400) {
            values.push(`400..${weights[0]}`);
          } else if (weights[0] < 400) {
            values.push(`${weights[0]}..400`);
          }
        } else if (weights.every(weight => weight === weights[0])) {
          values.push(`${weights[0]}`);
        } else {
          values.push(smallestLargestValues(weights, 100, 700));
        }
      })();
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
        } else if (grades.every(grade => grade === grades[0])) {
          values.push(`${grades[0]}`);
        } else {
          values.push(smallestLargestValues(grades, -25, 200));
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


  if (pluginOptions.extraIcons) {
    if (Array.isArray(pluginOptions.extraIcons)) {
      pluginOptions.extraIcons.forEach((icon: string) => {
        if (!symbols.includes(icon)) {
          symbols.push(icon);
        }
      });
    } else {
      (Object.values(pluginOptions.extraIcons) as string[][]).forEach((iconArray: string[]) => {
        iconArray.forEach((icon: string) => {
          if (!symbols.includes(icon)) {
            symbols.push(icon);
          }
        });
      });
    }
  }
  symbols.sort();
  url += "&icon_names=" + symbols.join(",");

  // Subset the font to only include the icons that are used
  url += "&display=block";

  // Fetch the remote CSS
  const filename = await fetchRemoteFile({ url, cache, ext: ".css", name: "material-symbols", httpHeaders: {
    // If we don't set a user agent, got's default user agent will be used, which Google doesn't see as supporting variable fonts
    "user-agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0`,
  } });
  reporter.verbose(`gatsby-plugin-material-symbols: Downloaded ${url} and saved to ${filename}`);
  let cssFile
  try {
    cssFile = fs.readFileSync(filename).toString();
  } catch (error) {
    reporter.error(`gatsby-plugin-material-symbols: ${error}`);
  }

  let fontUrls: string[] = [];
  if (pluginOptions.embedFonts) {
    // Convert all font urls to an embedded base64 font
    fontUrls = cssFile.match(/(?<=url\()[^)]+/g);
    if (fontUrls) {
      for (const fontUrl of fontUrls) {
        const fontFilename = await fetchRemoteFile({ url: fontUrl, cache, ext: ".woff2", name: "material-symbols" });
        const base64Font = fs.readFileSync(fontFilename).toString("base64");
        cssFile = cssFile.replace(fontUrl, `data:font/woff2;base64,${base64Font}`);
      }
    }
  }

  // Replace default .material-symbols-{symbolStyle}
  cssFile = cssFile.replace(/\.material-symbols-(outlined|rounded|sharp) {.*?$/gs, 
`.material-symbol {
  font-weight: normal;
  font-style: normal;
  font-size: inherit;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}

.material-symbol.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
}
.material-symbol.material-symbols-rounded {
  font-family: 'Material Symbols Rounded';
}
.material-symbol.material-symbols-sharp {
  font-family: 'Material Symbols Sharp';
}`)
  
  // Update the CSS file with changes
  fs.writeFileSync(filename, cssFile);

  // Write the CSS file to the plugin's cache
  // This is done so that gatsby-browser can import the CSS automatically
  const cacheDir = path.join(__dirname, "..", ".cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  const cacheFilePath = path.join(cacheDir, "material-symbols.css");
  fs.writeFileSync(cacheFilePath, cssFile);

  pluginOptions.verbose
  ? reporter.info(`gatsby-plugin-material-symbols: Found ${symbols.length} symbols and wrote CSS ${pluginOptions.embedFonts && `with ${fontUrls.length} embedded fonts`} from ${url} to ${cacheFilePath}`)
  : reporter.verbose(`gatsby-plugin-material-symbols: Found ${symbols.length} symbols and wrote CSS ${pluginOptions.embedFonts && `with ${fontUrls.length} embedded fonts`} from ${url} to ${cacheFilePath}`);
}