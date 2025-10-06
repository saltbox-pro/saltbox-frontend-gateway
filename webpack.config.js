const { merge } = require("webpack-merge");
const webpack = require("webpack");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const CopyPlugin = require("copy-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require("path");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "saltbox",
    projectName: "gateway",
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
      new CopyPlugin({
        patterns: [{ from: "public/locales", to: "locales" }],
      }),
      new webpack.DefinePlugin({
        DEVELOPMENT: argv.mode === "development",
        PRODUCTION: argv.mode === "production",
      }),
      new ModuleFederationPlugin({
        name: "gateway",
        filename: "remoteEntry.js",
        shared: {
          "mobx": {
            singleton: true,
            eager: false,
            requiredVersion: false,
          },
        },
      }),
    ],
    output: {
      filename: "index.js",
    },    
  });

  config.externals = [];

  return config;
};
