module.exports.pluginOptionsSchema = require("./dist/gatsby-node").pluginOptionsSchema
module.exports.onCreateWebpackConfig = require("./dist/gatsby-node").onCreateWebpackConfig

module.exports.onCreatePage = require("./dist/preprocessSource").onCreatePage
module.exports.preprocessSource = require("./dist/preprocessSource").preprocessSource

module.exports.onPreBuild = require("./dist/onPreBuild").onPreBuild