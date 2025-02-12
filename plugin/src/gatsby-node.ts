import type { GatsbyNode } from "gatsby";
import type { MaterialSymbolWeight, MaterialSymbolGrade, MaterialSymbolSize, MaterialSymbolCodepoints } from './types';

export const pluginOptionsSchema: GatsbyNode["pluginOptionsSchema"] = ({ Joi }) => {
  return Joi.object({
    // TODO: perPage
    /*perPage: Joi
      .boolean()
      .default(false)
      .description("When true, request a font file that only has the icons used on the current page.\nWhen false, request the same font file on all pages with every icon used across the entire site."),*/
    embedFonts: Joi
      .boolean()
      .default(true)
      .description("When true, embeds the font file in the CSS as base64.\nWhen false, links to the font file via gstatic, which will add more network requests."),
    extraIcons: Joi
      .any()
      .default([])
      .description("A list of additional icons to always include, even if they are not found during static analysis.\nThis is especially useful if you are changing the icon at runtime which will not be caught during static analysis.\nYou can optionally include which page the icons are used on if you have perPage enabled."),
    includeFill: Joi
      .boolean()
      .default(false)
      .description("When true, includes the entirety of the fill property in the font file.\nThis is useful if you change the fill to something that might not be caught during static analysis."),
    weightRange: Joi
      .array()
      .default([])
      .description("A range of weights to always include in the font file.\nThis is useful if you change the weight to something that might not be caught during sttaic analysis."),
    gradeRange: Joi
      .array()
      .default([])
      .description("A range of grades to always include in the font file.\nThis is useful if you change the grade to something that might not be caught during static analysis."),
    sizeRange: Joi
      .array()
      .default([])
      .description("A range of sizes to always include in the font file.\nThis is useful if you change the size to something that might not be caught during static analysis."),
    extraStyles: Joi
      .any()
      .default([])
      .description("A list of styles to always add to the font file, even if they are not found during static analysis.\nThis is useful if you change the style to something that might not be caught during static analysis.\nValid styles are 'outlined', 'rounded', and 'sharp'."),
    addSymbolsToPageContext: Joi
      .boolean()
      .default(true)
      .description("When true, the symbols that were found during static analysis will be added to the page's context.\nThis does not affect the functionality of the plugin."),
    verbose: Joi
      .boolean()
      .default(false)
      .description("Writes extra information to the console when true.")
  })
}

export type pluginOptions = {
  /** Default `false`
   * 
   * When true, request a font file that only has the icons used on the current page.
   * When false, request the same font file on all pages with every icon used across the entire site.
   */
  //perpage: boolean;
  /** Default `true`
   * 
   * @property `true`: embeds the font file in the CSS as base64.
   * @property `false`: links to the font file via gstatic, which will add more network requests.
   */
  embedFonts?: boolean;
  /** Default `[]`
   * 
   * A list of additional icons to always include, even if they are not found during static analysis.
   * This is especially useful if you are changing the icon at runtime which will not be caught during static analysis.
   * You can optionally include which page the icons are used on if you have perPage enabled.
   */
  extraIcons?: MaterialSymbolCodepoints[] | Record<string, MaterialSymbolCodepoints[]>;
  /** Default `false`
   * 
   * @property `true`: includes the entirety of the fill property in the font file.
   * 
   * This is useful if you change the fill to something that might not be caught during static analysis.
   */
  includeFill?: boolean;
  /** Default `[]`
   * 
   * A range of weights to always include in the font file.
   * 
   * This is useful if you change the weight to something that might not be caught during sttaic analysis.
   * 
   * @range `100` to `700`
   * @note Decimal places are not allowed.
   */
  weightRange?: MaterialSymbolWeight[];
  /** Default `[]`
   * 
   * A range of grades to always include in the font file.
   * 
   * This is useful if you change the grade to something that might not be caught during static analysis.
   * 
   * @range `-25` to `200`
   * @note Decimal places are not allowed.
   */
  gradeRange?: MaterialSymbolGrade[];
  /** Default `[]`
   * 
   * A range of sizes to always include in the font file.
   * 
   * This is useful if you change the size to something that might not be caught during static analysis.
   * 
   * @range `5` to `1200`
   */
  sizeRange?: number[];
  /** Default `[]`
   * 
   * A list of styles to always add to the font file, even if they are not found during static analysis.
   * 
   * This is useful if you change the style to something that might not be caught during static analysis.
   * 
   * @property `outlined`: The default style.
	 * @property `rounded`: Same as outlined except all sharp edges are rounded.
	 * @property `sharp`: Same as outlined except all rounded edges are sharpned.
   */
  extraStyles?: Array<"outlined" | "rounded" | "sharp"> | {
    outlined?: boolean;
    rounded?: boolean;
    sharp?: boolean;
  };
  /** Default `true`
   * 
   * @property `true`: the symbols that were found during static analysis will be added to the page's context.
   * 
   * @note This does not affect the functionality of the plugin.
   */
  addSymbolsToPageContext?: boolean;
  /** Default `false`
   * 
   * @property `true`: writes extra information to the console.
   */
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
