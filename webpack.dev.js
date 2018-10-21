const Merge = require("webpack-merge");
const EnvLoader = require('dotenv-webpack');

const common = require("./webpack.common.js");

module.exports = Merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        new EnvLoader({
            path: './environment.env',
            systemvars: true
        })
    ]
});