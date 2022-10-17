const path = require("path");

module.exports = {
  // 配置打包入口
  entry: "./src/index.js",
  // 出口
  output: {
    // 指定打包后的文件名
    filename: "bundle.js",
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "./dist"),
  },
  // 指定打包模式，可选项：development | production | none
  mode: "none",
};
