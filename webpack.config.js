const path = require("path");
const webpack = require("webpack");
const version = require("./package.json").version;

const prod = process.env.NODE_ENV === "production";

module.exports = {
  entry: "./src/index.ts",
  mode: prod ? "production" : "development",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)
    modules: ["node_modules", path.resolve(__dirname, "src")],
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js", ".json", ".mjs"]
  },

  context: path.resolve(__dirname, "./"),
  target: "node",
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: []
      }
    ]
  }
};
