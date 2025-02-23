# gatsby-plugin-material-symbols
This plugin exposes a component that you can use in your Gatsby site to add a Material Symbol in a single element.

Behind the scenes, the plugin performs several optimizations at build-time to make the [FOIT](https://fonts.google.com/knowledge/glossary/foit) as quick as possible. In most cases, the plugin removes FOIT all-together, instead opting to delay [FCP](https://web.dev/articles/fcp) by a few milliseconds.

## How to install
 1. Install `gatsby-plugin-material-symbols` via NPM
	```shell
	npm install gatsby-plugin-material-symbols
	```
2. Add the plugin to your `gatsby-config` file
	```typescript
	{
	  plugins: [
	    "gatsby-plugin-material-symbols"
	  ]
	}
	```
3. Import the `MaterialSymbol` component and use it in your site
	```tsx
	import { MaterialSymbol } from "gatsby-plugin-material-symbols"
	
	export function Page() {
	  return <MaterialSymbol icon="search" />
	}
	```

## Options
### `embedFonts`
Whether to embed the font file(s) into the site's CSS as base64.
- **Default**: `true`
- **Accepted types**:
	- `true`: All fonts are embedded in CSS
	- `false`: Links to the fonts on `gstatic.com` which will add more network requests, but make FCP a bit quicker and add a FOIT to all Material Symbols

### `extraIcons`
A list of additional icons to always include, even if they are not found during static analysis. This is useful if you change an icon at runtime, which will not be caught during static analysis.
You can optionally include which style the added icon should be associated with. If an added icon is associated with one style, it will not be included in the font(s) for other styles.
- **Default**: `[]`
- **Accepted types**:
	- `MaterialSymbolCodepoints[]`: A list of codepoints to additionally include in all icon styles
	- `Record<"outlined" | "rounded" | "sharp", MaterialSymbolCodepoints[] | MaterialSymbolCodepoints>`: A list of styles and which Material Symbols to always include in the given style

### `includeFill`
Whether or not to always include the entirety of the [`FILL` axis](https://m3.material.io/styles/icons/applying-icons#ebb3ae7d-d274-4a25-9356-436e82084f1f) in all styles.
- **Default**: `false`
- **Accepted types**:
	- `true`: Always include the entirety of the `FILL` axis in all font(s)
	- `false`: Only include the extents of the `FILL` axis found during static analysis

### `weightRange`
A range of [weights](https://m3.material.io/styles/icons/applying-icons#d7f45762-67ac-473d-95b0-9214c791e242) to always include in all styles.
- **Default**: `[]`
- **Accepted types**:
	- `MaterialSymbolWeight[]`: A range of weights to always include in all styles. Minimum = 100, Maximum = 700
		- Example of a range: `[210, 600]`

### `gradeRange`
A range of [grades](https://m3.material.io/styles/icons/applying-icons#3ad55207-1cb0-43af-8092-fad2762f69f7) to always include in all styles.
- **Default**: `[]`
- **Accepted types**:
	- `MaterialSymbolGrade[]`: A range of grades to always include in all styles. Minimum = 0, Maximum = 225
	  - Example of a range: `[0, 110]`

### `sizeRange`
A range of [optical sizes](https://m3.material.io/styles/icons/applying-icons#b41cbc01-9b49-4a44-a525-d153d1ea1425) to always include in all styles.
- **Default**: `[]`
- **Accepted types**:
	- `number[]`: A range of optical sizes to always include in all styles. Minimum = 5, Maximum = 1200. Decimal places are allowed
		- Example of a range: `[12.5, 64]`

### `extraStyles`
A list of additional styles to always include, even if they are found during static analysis. This is useful if you change a style at runtime, which will not be caught during static analysis.
- **Default**: `[]`
- **Accepted types**:
	- `Array<"outlined" | "rounded" | "sharp">`: A list of additional styles to always include

> [!TIP]
> Curious about what each style looks like? You can see on the [Material Design website](https://m3.material.io/styles/icons/applying-icons#06499df4-5998-4724-bea1-8d87327fde70) or on the [Material Symbols catalogue](https://fonts.google.com/icons) if you prefer.

### `verbose`
Prints useful or interesting information to the console.
- **Default**: `false`
- **Accepted types**:
	- `true`: Prints information to the console
	- `false`: Do not print anything to the console relating to `gatsby-plugin-material-symbols`

## Performance optimizations

When requesting assets from the Google Fonts CSS API, you can add several parameters to any given query to trim down the size of the returned font file. Most don't do this because it's pretty annoying to write a script to collect every icon you're using in your site, but doing so is certainly worth it.

With all icons and the full extent of all [variable axes](https://fonts.google.com/knowledge/glossary/axis_in_variable_fonts) included (which is the default font file distributed by Google Fonts), [`MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].woff2`](https://github.com/google/material-design-icons/blob/c51274e96fc3a6d11d863e39f0e9fa194fe0cc9a/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.woff2) comes out to 3.16 MB. That's a massive file for any user to download, especially considering you're probably only using a couple dozen of the 3,738 icons included in the font file.

By removing unused variable axes, in this example to only include `FILL@1`, `opsz@20..48`, `wght@500` and `GRAD@0..200`, we can cut the font's file size from 3.16 MB to 1.64 MB (1.92x smaller).

Then by only including icons which are used, in this example `add`, `arrow_forward`, `close`, `delete`, `forward`, `fullscreen`, `home`, `menu`, `open_in_full`, `open_in_new`, `redo`, `refresh`, `reply`, `search`, `star`, `undo`, we can further reduce the font's file size from 1.64 MB to 6.42 KB (255.45x smaller).

Overall, that's a reduction from 3.16 MB to 6.42 KB (504.75x smaller). Yes, really.

By making the font file 500x smaller, Material Symbols go from being quite a large burden (the size of a high-quality image) to probably being smaller than most of the JavaScript you're loading on your site.

## Contributing
See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for instructions on how to contribute changes.