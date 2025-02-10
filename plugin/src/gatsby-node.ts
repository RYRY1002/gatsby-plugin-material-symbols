import type { GatsbyNode } from "gatsby";

export const pluginOptionsSchema: GatsbyNode["pluginOptionsSchema"] = ({ Joi }) => {
  return Joi.object({
    // TODO: perPage
    /*perPage: Joi
      .boolean()
      .default(false)
      .description("When true, request a font file that only has the icons used on the current page. When false, request the same font file on all pages with every icon used across the entire site."),*/
    embedFonts: Joi
      .boolean()
      .default(true)
      .description("When true, embeds the font file in the CSS as base64. When false, links to the font file in the CSS."),
    extraIcons: Joi
      .any()
      .default([])
      .description("A list of additional icons to include. You can optionally include which page the icons are used on if you have perPage enabled. This is especially useful if you are changing the icon at runtime which will not be caught during static analysis."),
    includeFill: Joi
      .boolean()
      .default(false)
      .description("When true, includes the entirety of the fill property in the font file. This is useful if you change the fill to something that might not be caught during static analysis."),
    weightRange: Joi
      .array()
      .default([])
      .description("A range of weights to include in the font file. This is useful if you change the weight to something that might not be caught during sttaic analysis."),
    gradeRange: Joi
      .array()
      .default([])
      .description("A range of grades to include in the font file. This is useful if you change the grade to something that might not be caught during static analysis."),
    sizeRange: Joi
      .array()
      .default([])
      .description("A range of sizes to include in the font file. This is useful if you change the size to something that might not be caught during static analysis."),
    styles: Joi
      .object()
      .default({})
      .description("A list of styles to include in the font file. This is useful if you change the style to something that might not be caught during static analysis."),
    verbose: Joi
      .boolean()
      .default(false)
      .description("Writes extra information to the console when true.")
  })
}

export type pluginOptions = {
  //perpage: boolean;
  extraIcons?: string[] | Record<string, string[]>;
  includeFill?: boolean;
  weightRange?: number[];
  gradeRange?: number[];
  sizeRange?: number[];
  styles?: {
    outlined: boolean;
    rounded: boolean;
    sharp: boolean;
  };
  verbose?: boolean;
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
