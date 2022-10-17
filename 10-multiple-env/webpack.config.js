const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 抽离CSS
const miniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩CSS
const cssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// 压缩JS
const TerserPlugin = require("terser-webpack-plugin");
const toml = require("toml");
const yaml = require("yaml");
const json5 = require("json5");

module.exports = (env) => {
  console.log(env);
  return {
    // 配置打包入口，多入口
    entry: {
      index: "./src/index.js",
      another: "./src/another-module.js",
    },

    // 出口
    output: {
      // 指定打包后的文件名
      filename: "scripts/[name].[contenthash].js",
      // 指定打包后文件的输出路径，一定是绝对路径
      path: path.resolve(__dirname, "./dist"),
      // 打包清理dist目录
      clean: true,
      // 自定义输出文件名第一种方式，contenthash：根据文件内容生成hash戳，ext：使用原文件的后缀名
      assetModuleFilename: "images/[contenthash][ext]",
      publicPath: "http://localhost:8080/",
    },

    // 指定打包模式，可选项：development | production | none
    mode: env.production ? "production" : "development",

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

      new miniCssExtractPlugin({
        // 指定抽离后样式文件的路径和名称
        filename: "styles/[contenthash].css",
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

        // 使用css-loader，打包css文件
        {
          test: /\.(css|less)$/,
          // 使用多个loader，加载顺序：从右往左
          use: [miniCssExtractPlugin.loader, "css-loader", "less-loader"],
        },

        // 打包fonts字体
        {
          test: /.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },

        // 打包csv文件
        {
          test: /\.(csv|tsv)$/,
          use: "csv-loader",
        },

        // 打包想xml文件
        {
          test: /\.xml$/,
          use: "xml-loader",
        },

        {
          test: /\.toml$/,
          type: "json",
          parser: {
            parse: toml.parse,
          },
        },
        {
          test: /\.yaml$/,
          type: "json",
          parser: {
            parse: yaml.parse,
          },
        },
        {
          test: /\.json5$/,
          type: "json",
          parser: {
            parse: json5.parse,
          },
        },

        // babel-loader
        {
          test: /\.js$/,
          // 排除 node_modules 目录
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              // 预设
              presets: ["@babel/preset-env"],
            },
          },
        },
      ],
    },

    // 优化选项
    optimization: {
      minimizer: [new cssMinimizerPlugin(), new TerserPlugin()],
      // 通过webpack内置插件：split-chunks-plugin实现代码分割
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
  };
};
