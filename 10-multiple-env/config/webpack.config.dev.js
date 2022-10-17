module.exports = {
  // 出口
  output: {
    // 指定打包后的文件名
    filename: "scripts/[name].js",
  },

  // 指定打包模式，可选项：development | production | none
  mode: "development",

  // 开启 source-map，帮助查找bug的位置
  devtool: "inline-source-map",

  devServer: {
    // 告知webpack-dev-server，将dist目录下的文件作为web服务的根目录。
    static: "./dist",
  },
};
