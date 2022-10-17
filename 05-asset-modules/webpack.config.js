const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // 配置打包入口
  entry: "./src/index.js",

  // 出口
  output: {
    // 指定打包后的文件名
    filename: "bundle.js",
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "./dist"),
    // 打包清理dist目录
    clean: true,
    // 自定义输出文件名第一种方式，contenthash：根据文件内容生成hash戳，ext：使用原文件的后缀名
    assetModuleFilename: "images/[contenthash][ext]",
  },

  // 指定打包模式，可选项：development | production | none
  mode: "development",

  // 开启 source-map，帮助查找bug的位置
  devtool: "inline-source-map",

  // 配置插件
  plugins: [
    new HtmlWebpackPlugin({
      // 指定模板路径
      template: "./index.html",
      // 指定输出的文件名
      filename: "app.html",
      // 生成的script标签插入到什么位置
      inject: "body",
    }),
  ],

  devServer: {
    // 告知webpack-dev-server，将dist目录下的文件作为web服务的根目录。
    static: "./dist",
  },

  module: {
    rules: [
      // 加载所有的PNG图片资源
      {
        test: /\.png$/,
        type: "asset/resource",
        // 自定义输出文件名的第二种方式，该方式优先级更高
        generator: {
          filename: "images/[contenthash][ext]",
        },
      },

      // 打包svg图片资源
      {
        test: /\.svg$/,
        type: "asset/inline",
      },

      {
        test: /\.txt$/,
        type: "asset/source",
      },

      // 通用资源类型
      {
        test: /\.jpg$/,
        type: "asset",
        // 更改临界值
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 * 1024, // 4Mb
          },
        },
      },
    ],
  },
};
