const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./app.js",
  output: {
    clean: true,
  },
  devtool: "eval",
  plugins: [new HtmlWebpackPlugin()],
  devServer: {
    static: path.resolve(__dirname, "./dist"),
    compress: true,
  },
};
