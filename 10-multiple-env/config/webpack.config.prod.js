// 压缩CSS
const cssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// 压缩JS
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  // 出口
  output: {
    // 指定打包后的文件名
    filename: "scripts/[name].[contenthash].js",
    publicPath: "http://localhost:8080/",
  },

  // 指定打包模式，可选项：development | production | none
  mode: "production",

  // 优化选项
  optimization: {
    minimizer: [new cssMinimizerPlugin(), new TerserPlugin()],
  },

  // 关闭性能提示
  performance: {
    hints: false,
  },
};
