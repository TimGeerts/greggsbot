const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const envLoader = require('dotenv-webpack');

module.exports = merge(common, {
    mode: 'production',
    optimization: { minimize: false },
    plugins: [
        new envLoader({
            path: './environment.env',
            systemvars: true
        })
    ]
});