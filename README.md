# gatsby-plugin-material-symbols
This plugin exposes a React component to include in your site and also performs several performance optimizations on the component during build time, including subsetting the font (removing all unused characters) and instancing the variable axes (removing all unused variable font axes and limiting any used axes to only include the extents to which they are used).

## How to install
\#TODO

## Available options (if any)
\#TODO

## When do I use this plugin?
\#TODO

## Examples of usage
\#TODO

## Performance optimizations
When requesting assets from Google Fonts, you can add several parameters to any given query to trim down the size of the returned font file. Most don't do this because it's pretty annoying to write a script to collect every icon you're using in your site, but doing so is certainly worth it.

With all icons and the full extent of all variable axes included (which is the default font file distributed by Google Fonts), [`MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].woff2`](https://github.com/google/material-design-icons/blob/c51274e96fc3a6d11d863e39f0e9fa194fe0cc9a/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.woff2) comes out to 3.16 MB. That's a massive file for any user to download, especially considering you're probably only using a couple dozen of the 3,738 icons (0.5%) included in the font file.

By removing unused variable axes, in this example to only include `FILL@1`, `opsz@20..48`, `wght@500` and `GRAD@0..200`, we can cut the font's file size from 3.16 MB to 1.64 MB (1.92x smaller).

By only including icons which are used, in this example `add`, `arrow_forward`, `close`, `delete`, `forward`, `fullscreen`, `home`, `menu`, `open_in_full`, `open_in_new`, `redo`, `refresh`, `reply`, `search`, `star`, `undo`, we can cut the font's file size from 3.16 MB to 9.35 KB (346.48x smaller). Yes, really.

Combining these two optimizations together, we can limit the font file to only include used icons and used extents of the variable axes. This cuts the font's file size from 3.16 MB to 6.42 KB (504.75x smaller).

By making the font file 500x smaller, you take Material Symbols from being quite a large burden (the size of a high-quality image) to probably being smaller than most of the JavaScript you're loading on your site.

## How to run tests

## How to develop locally