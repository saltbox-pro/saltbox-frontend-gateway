const { merge } = require("webpack-merge");
const webpack = require("webpack");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const path = require("path");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "saltbox",
    projectName: "gate",
    webpackConfigEnv,
    argv,
    outputSystemJS: false,
  });

  const config = merge(defaultConfig, {
    devServer: {
      port: 4203,
    },
    resolve: {
      alias: {
        "saltbox-gateway": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        DEVELOPMENT: argv.mode === "development",
        PRODUCTION: argv.mode === "production",
      }),
    ],
    output: {
      filename: "index.js",
    },
  });

  config.externals = [];

  return config;
};
