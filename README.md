# 学习 webpack 构建工具

官网：https://webpack.js.org/
中文网：https://webpack.docschina.org/

## 1. 安装 webpack

```shell
npm install webpack webpack-cli --save-dev
```

## 2. 运行打包

在终端输入以下指令打包：

```shell
npx webpack
```

指定配置项

```shell
npx webpack --entry ./src/index.js --mode production
```

## 3. 通过配置文件个性化打包

在文件根目录下面新建一个 **webpack.config.js**，在该文件里面定制我们的配置项参数

```js
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
```

## 4. 自动引入资源

在 index.html 文件中手动引入打包后的 JS 文件，很不方便，我们通过 webpack 的 HtmlWebpackPlugin 插件实现自动引入资源

1. 首先安装插件

```shell
npm install --save-dev html-webpack-plugin
```

2. 在 webpack.config.js 中使用插件

```js
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
  },
  // 指定打包模式，可选项：development | production | none
  mode: "none",
  // 配置插件
  plugins: [new HtmlWebpackPlugin()],
};
```

3. 重新执行 `npx webpack` 指令打包，会生成 dist 文件夹，里面会自动生成一个 `indx.html` 文件并且引用好打包好的 JS 文件。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Webpack App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script defer src="bundle.js"></script>
  </head>

  <body></body>
</html>
```

4. 基于已有的 `index.html` 文件，实现自动引入，我们需要修改一下配置文件

```js
new HtmlWebpackPlugin({
  // 指定模板路径
  template: "./index.html",
  // 指定输出的文件名
  filename: "app.html",
  // 生成的script标签插入到什么位置
  inject: "body",
});
```

## 5. 打包后自动清理 dist 目录

仔细留意一下，我们发现`dist/index.html`仍旧存在，这个文件是上次生成的残留文件，已经没有用了。可见，webpack 将生成文件并放置在`/dist`文件夹中，但是它不会追踪哪些文件是实际在项目中用到的。通常比较推荐的做法是，在每次构建前清理/dist 文件夹，这样只会生成用到的文件。让我们使用`output.clean `配置项实现这个需求。

```js
output: {
    // 指定打包后的文件名
    filename: "bundle.js",
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "./dist"),
    // 打包清理dist目录
    clean: true,
  }
```

## 6. 搭建开发环境

搭建开发环境，每次打包后，自动更新网页内容，修改 `mode` 选项为 `development`

```js
mode: "development",
```

### 6.1. 使用 source map

当 webpack 打包源代码时，可能会很难追踪到 error(错误)和 warning(警告)在源代码中的原始位置。例如，如果将三个源文件(a.js, b.js 和 c.js)打包到一个 bundle ( bundle.js)中，而其中一个源文件包含一个错误，那么堆栈跟踪就会直接指向到 bundle.js 。你可能需要准确地知道错误来自于哪个源文件，所以这种提示这通常不会提供太多帮助。

为了更容易地追踪 error 和 warning, JavaScript 提供了 source maps 功能，可以将编译后的代码映射回原始源代码。如果一个错误来自于 b.js，source map 就会明确的告诉你。

在本篇中，我们将使用 `inline-source-map` 选项:

```js
// 开启 source-map，帮助查找bug的位置
devtool: "inline-source-map";
```

### 6.2. 使用 watch mode(观察模式)

在每次编译代码时，手动运行 `npx webpack` 会显得很麻烦。
我们可以在 webpack 启动时添加"watch"参数。如果其中一个文件被更新，代码将被重新编译，所以你不必再去手动运行整个构建。

```shell
npx webpack --watch
```

### 6.3. 使用 webpack-dev-server

webpack-dev-server 为你提供了一个基本的 web server,并且具有 live reloading(实时重新加载)功能。先安装：

```shell
npm install --save-dev webpack-dev-server
```

修改配置文件，告知 dev server,从什么位置查找文件:

```js
devServer: {
    static: "./dist",
  }
```

以上配置告知 webpack-dev-server,将 dist 目录下的文件作为 web 服务的根目录。

最后，在终端执行 `npx webpack-dev-server` 指令，运行项目。

## 7. 资源模块

资源模块(asset module)是一种模块类型，它允许使用资源文件（字体，图标等）而无需配置额外 loader。

资源模块类型(asset module type)，通过添加 4 种新的模块类型，来替换所有这些 loader：

- `asset/resource` 发送一个单独的文件并导出 URL。之前通过使用 file-loader 实现
- `asset/inline` 导出一个资源的 data URI。之前通过使用 url-loader 实现。
- `asset/source` 导出资源的源代码。之前通过使用 raw-loader 实现。
- `asset` 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现。

### 7.1. Resource 资源

```js
module: {
    rules: [
      // 加载所有的PNG图片资源
      {
        test: /\.png$/,
        type: "asset/resource",
      },
    ],
  }
```

#### 自定义输出文件名

默认情况下，asset/resource 模块以 [hash][ext][query] 文件名发送到输出目录。

可以通过在 webpack 配置中设置 output.assetModuleFilename 来修改此模板字符串：

```js
output: {
    // 指定打包后的文件名
    filename: "bundle.js",
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "./dist"),
    // 打包清理dist目录
    clean: true,
    // 自定义输出文件名第一种方式，contenthash：根据文件内容生成hash戳，ext：使用原文件的后缀名
    assetModuleFilename: "images/[contenthash][ext]",
  }
```

另一种自定义输出文件名的方式是，将某些资源发送到指定目录：

```js
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
    ],
  }
```

### 7.2. inline 资源

```js
// 打包svg图片资源
{
  test: /\.svg$/,
  type: "asset/inline",
}
```

### 7.3. source 资源

```js
{
  test: /\.txt$/,
  type: "asset/source",
}
```

### 7.4. 通用资源类型

通用资源类型 asset ,在导出一个 data URI 和发送一个单独的文件之间自动选择。

```js
module: {
  rules: [
    // 通用资源类型
    {
      test: /\.jpg$/,
      type: "asset",
    },
  ];
}
```

webpack 将按照默认条件，自动地在 resource 和 inline 之间进行选择：小于 8kb 的文件，将会视为 inline 模块类型，否则会被视为 resource 模块类型。

```js
module: {
  rules: [
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
  ];
}
```

## 8. 管理资源

### 8.1. 打包 CSS 文件

默认情况下，webpack 无法打包 css 文件，我们可以安装`css-loader`，css-loader 会对 @import 和 url() 进行处理，就像 js 解析 import/require() 一样。来解决这个问题：

```shell
npm install css-loader -D
```

使用：

```js
module: {
  rules: [
    // 使用css-loader，打包css文件
    {
      test: /\.css$/,
      use: "css-loader",
    },
  ];
}
```

安装 style-loader，可以把 CSS 插入到 DOM 中。

```shell
npm install style-loader -D
```

使用：

```js
module: {
  rules: [
    // 使用css-loader，打包css文件
    {
      test: /\.css$/,
      // 使用多个loader，加载顺序：从右往左
      use: ["style-loader", "css-loader"],
    },
  ];
}
```

### 8.2. 打包 less

需要安装`less-loader`、`less`:

```shell
npm install less-loader less -D
```

使用：

```js
module: {
  rules: [
    // 使用css-loader，打包css文件
    {
      test: /\.(css|less)$/,
      // 使用多个loader，加载顺序：从右往左
      use: ["style-loader", "css-loader", "less-loader"],
    },
  ];
}
```

### 8.3. 抽离和压缩 CSS

在多数情况下，我们也可以进行压缩 CSS，以便在生产环境中节省加载时间，同时还可以将 CSS 文件抽离成-个单
独的文件。实现这个功能，需要 `mini-css-extract-plugin` 这个插件来帮忙。安装插件:

```shell
npm install mini-css-extract-plugin --save-dev
```

本插件会将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和
SourceMaps 的按需加载。

本插件基于 webpack v5 的新特性构建，并且需要 webpack 5 才能正常工作。

之后将 loader 与 plugin 添加到你的 webpack 配置文件中:

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 抽离和压缩CSS
const miniCssExtractPlugin = require("mini-css-extract-plugin");

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

  module: {
    rules: [
      // 使用css-loader，打包css文件
      {
        test: /\.(css|less)$/,
        // 使用多个loader，加载顺序：从右往左
        use: [miniCssExtractPlugin.loader, "css-loader", "less-loader"],
      },
    ],
  },
};
```

压缩 CSS 文件，我们需要再安装一个插件：`css-minimizer-webpack-plugin`

```shell
npm install css-minimizer-webpack-plugin -D
```

使用：

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 抽离CSS
const miniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩CSS
const cssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  // 配置打包入口
  entry: "./src/index.js",

  // 指定打包模式，可选项：development | production | none
  mode: "production",

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

  module: {
    rules: [
      // 使用css-loader，打包css文件
      {
        test: /\.(css|less)$/,
        // 使用多个loader，加载顺序：从右往左
        use: [miniCssExtractPlugin.loader, "css-loader", "less-loader"],
      },
    ],
  },

  // 优化选项
  optimization: {
    minimizer: [new cssMinimizerPlugin()],
  },
};
```

> 注意：cssMinimizerPlugin 需要设置`mode: "production"`

### 8.4. 加载 images 图像

假如，现在我们正在下载 CSS,但是像 background 和 icon 这样的图像，要如何处理呢？在 webpack5 中，可以使
用内置的 `Asset Modules`，我们可以轻松地将这些内容混入我们的系统中，这个我们在"资源模块"一节中已经介绍
了。这里再补充一个知识点，在 css 文件里也可以直接引用文件，修改 style.css 和入口 index.js :

```css
.block-bg {
  background-image: url(./assets/webpack-logo.svg);
}
```

```js
block.style.cssText = "width: 200px; height: 200px; background-color: #2b3a42";
block.classList.add("block-bg");
```

### 8.5. 加载 fonts 字体

那么，像字体这样的其他资源如何处理呢?使用 Asset Modules 可以接收并加载任何文件，然后将其输出到构建目
录。这就是说，我们可以将它们用于任何类型的文件，也包括字体。让我们更新 webpack.config.js 来处理字
体文件:

```js
module: {
  rules: [
    {
      test: /.(woff|woff2|eot|ttf|otf)$/i,
      type: "asset/resource",
    },
  ];
}
```

### 8.6. 加载数据

此外，可以加载的有用资源还有数据，如 JSON 文件，CSV、 TSV 和 XML。类似于 NodeJS, JSON 支持实际上是内
置的，也就是说 `import Data from './data.json'` 默认将正常运行。要导入 CSV、TSV 和 XML，你可以使
用 `csv-loader` 和 `xml-loader`。让我们处理加载这三类文件:

```shell
npm install --save-dev csv-loader xml-loader
```

使用：

```js
module: {
    rules: [
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
    ],
  },
```

### 8.7. 自定义 JSON 模块 parser

通过使用**自定义 parser**替代特定的 webpack loader,可以将任何 toml 、yaml 或 json5 文件作为 JSON 模块导入。

假设你在 src 文件夹下有一个 data.toml 、一个 data.yaml 以及一个 data.json5 文件:

安装：

```shell
npm install toml yaml json5 -D
```

使用：

```js
const toml = require("toml");
const yaml = require("yaml");
const json5 = require("json5");

module.exports = {
  module: {
    rules: [
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
    ],
  },
};
```

## 9. 使用 babel-loader

安装:

```shell
npm install -D babel-loader @babel/core @babel/preset-env
```

- babel-loader：在 webpack 里应用 babel 解析 ES6 的桥梁
- @babel/core: babel 核心模块
- @babel/preset-env: babel 预设，一组 babel 插件的集合

在 webpack 配置中，需要将 babel-loader 添加到 module 列表中，就像下面这样:

```js
module: {
    rules: [
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
```

## 10. 代码分离

常用的代码分离方法：

- 入口起点：使用`entry`配置手动地分离代码，缺点：多个入口，共用文件会重复打包。
- 防止重复：使用`Entry dependencied` 或者`SplitChunksPlugin` 去重和分离代码。
- 动态导入：通过模块的内联函数调用来分离代码。

### 10.1. 入口起点

这是迄今为止最简单直观的分离代码的方式。不过，这种方式手动配置较多，并有一些隐患，我们将会解决这些问
题。先来看看如何从 main bundle 中分离 another module(另-个模块):
在 src 目录下创建 another-module.js 文件，该文件使用了一个第三方库 lodash:

```js
import _ from "lodash";
console.log(_.join(["hello", "webpack", "so", "easy"], " "));
```

在 index.js 文件中，我们也使用一下 lodash 这个库：

```js
import _ from "lodash";
console.log(_.join(["index", "module", "loaded!"], " "));
```

修改配置文件：

```js
const path = require("path");

module.exports = {
  // 配置打包入口，多入口
  entry: {
    index: "./src/index.js",
    another: "./src/another-module.js",
  },

  // 出口
  output: {
    // 指定打包后的文件名
    filename: "[name].bundle.js",
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "./dist"),
    // 打包清理dist目录
    clean: true,
    // 自定义输出文件名第一种方式，contenthash：根据文件内容生成hash戳，ext：使用原文件的后缀名
    assetModuleFilename: "images/[contenthash][ext]",
  },
};
```

执行打包后，会发现通过入口起点这种方式，打包后的两个文件都包含了 lodash 的代码，会造成代码重复的问题。

### 10.2. 防止重复

- 入口依赖
  配置`dependOn option`选项，这样可以在多个 chunk 之间共享模块:

```js
const path = require("path");

module.exports = {
  // 配置打包入口，多入口
  entry: {
    index: {
      import: "./src/index.js",
      // 通过dependOn选项，将共用模块抽离为单独的chunk
      dependOn: "shared",
    },
    another: {
      import: "./src/another-module.js",
      dependOn: "shared",
    },
    // 通过shared指定共用的包名
    shared: "lodash",
  },

  // 出口
  output: {
    // 指定打包后的文件名
    filename: "[name].bundle.js",
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "./dist"),
    // 打包清理dist目录
    clean: true,
    // 自定义输出文件名第一种方式，contenthash：根据文件内容生成hash戳，ext：使用原文件的后缀名
    assetModuleFilename: "images/[contenthash][ext]",
  },
};
```

- 除了上面的方式外，还可以通过 webpack 内置的插件：split-chunks-Plugin 来实现：

修改配置文件：

```js
const path = require("path");

module.exports = {
  // 配置打包入口，多入口
  entry: {
    index: "./src/index.js",
    another: "./src/another-module.js",
  },

  // 出口
  output: {
    // 指定打包后的文件名
    filename: "[name].bundle.js",
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "./dist"),
    // 打包清理dist目录
    clean: true,
    // 自定义输出文件名第一种方式，contenthash：根据文件内容生成hash戳，ext：使用原文件的后缀名
    assetModuleFilename: "images/[contenthash][ext]",
  },

  // 优化选项
  optimization: {
    // 通过webpack内置插件：split-chunks-plugin实现代码分割
    splitChunks: {
      chunks: "all",
    },
  },
};
```

### 10.3. 动态导入

当涉及到动态代码拆分时，webpack 提供了两个类似的技术。第一种，也是推荐选择的方式，使用符合 ECMASCAipt 提案的 `import()`语法来实现动态导入。第二种，则是 webpack 的遗留功能，使用 webpack 特定的 `require.ensure`。让我们先尝试使用第一种.....

```js
function getComponent() {
  return import("lodash").then(({ default: _ }) => {
    const element = document.createElement("div");
    element.innerHTML = _.join(["Hello", "webpack"], " ");
    return element;
  });
}

getComponent().then((element) => {
  document.body.appendChild(element);
});
```

### 10.4. 动态导入的应用：懒加载

懒加载或者按需加载，是一种很好的优化网页或应用的方式。这种方式实际上是先把你的代码在-些逻辑断点处分
离开，然后在一些代码块中完成某些操作后，立即引用或即将引用另外- - 些新的代码块。这样加快了应用的初始加
载速度，减轻了它的总体体积，因为某些代码块可能永远不会被加载。

```js
const button = document.createElement("button");
button.textContent = "点击执行加法运算";
button.addEventListener("click", function () {
  // 懒加载模块，魔法注释，给模块重命名
  import(/* webpackChunkName: 'math' */ "./math.js").then(({ add }) => {
    console.log(add(3, 5));
  });
});
document.body.appendChild(button);
```

### 10.5. 动态导入的应用：预获取/预加载模块

Webpack v4.6.0+增加了对预获取和预加载的支持。
在声明 import 时，使用下面这些内置指令，可以让 webpack 输出"resource hint(资源提示)"，来告知浏览器:

- prefetch(预获取): 将来某些导航下可能需要的资源
- preload(预加载): 当前导航下可能需要资源

```js
const button = document.createElement("button");
button.textContent = "点击执行加法运算";
button.addEventListener("click", function () {
  // 懒加载模块，魔法注释：webpackChunkName给模块重命名，webpackPrefetch预获取，webpackPreload预加载
  import(
    /* webpackChunkName: 'math', webpackPrefetch: true */ "./math.js"
  ).then(({ add }) => {
    console.log(add(3, 5));
  });
});
document.body.appendChild(button);
```

添加第二句魔法注释: `webpackPrefetch: true` 告诉 webpack 执行预获取。这会生成 `<link rel="prefetch" href="math.js">` 并追加到页面头部，指示
着浏览器在闲置时间预取 math.js 文件。

## 11. 缓存

### 11.1. 配置输出文件的文件名

我们可以通过替换 `output.filename` 中的 `substitutions` 设置，来定义输出文件的名称。webpack 提供了一种使用称为 `substitution`(可替换模板字符串)的方式，通过带括号字符串来模板化文件名。其中，[contenthash] substitution 将根据资源内容创建出唯一 hash。当资源内容发生变化时，[contenthash] 也会发生变化。

```js
module.exports = {
  output: {
    // 指定打包后的文件名
    filename: "[name].[contenthash].js",
  },
};
```

### 11.2. 缓存第三方库

将第三方库(library) (例如 lodasp)提取到单独的 vendor chunk 文件中，是比较推荐的做法，这是因为，它们
很少像本地的源代码那样频繁修改。因此通过实现以上步骤，利用 client 的长效缓存机制，命中缓存来消除请求，
并减少向 server 获取资源，同时还能保证 client 代码和 server 代码版本一致。我们在
`optimization.splitChunks` 添加如下 `cacheGroups` 参数并构建:

```js
// 优化选项
optimization: {
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
```

### 11.3. 将 js 文件放到一个文件夹中

目前，全部 js 文件都在 dist 文件夹根目录下，我们尝试把它们放到一个文件夹中，这个其实也简单，修改配置文件:

```js
output: {
  // 指定打包后的文件名
  filename: "scripts/[name].[contenthash].js",
},
```

## 12. 拆分开发环境和生产环境配置

### 12.1. 公共路径

publicPath 配置选项在各种场景中都非常有用。你可以通过它来指定应用程序中所有资源的基础路径。

- 基于环境设置
  在开发环境中，我们通常有一个 `assets/` 文件夹，它与索引页面位于同一级别。这没太大问题，但是，如果
  我们将所有静态资源托管至 CDN,然后想在生产环境中使用呢?
  想要解决这个问题，可以直接使用一个 environment variable(环境变量)。假设我们有一个变量
  ASSET_PATH:

  ```js
  output: {
    publicPath: "http://localhost:8080/",
  },
  ```

### 12.2. 环境变量

想要消除 webpack.config.js 在开发环境和生产环境之间的差异，你可能需要环境变量(environment variable)。

webpack 命令行**环境配置**的 `--env` 参数，可以允许你传入任意数量的环境变量。而在 webpack.config.js 中可以访问到这些环境变量。例如，`--env production` 或 `--env goal=local`。

```shell
npx webpack --env goal=local --env production --progress
```

对于我们的 webpack 配置, 有一个必须要修改之处。通常，module.exports 指向配置对象。要使用 env 变
量，你必须将 module.exports 转换成一个函数:

```js
module.exports = (env) => {
  return {
    //...
    //根据命令行参数env 来设置不同环境的mode
    mode: env.production ? "production" : " development",
    //...
  };
};
```

### 12.3. 拆分配置文件

目前，生产环境和开发环境使用的是一个配置文件，我们需要将这两个文件单独放到不同的配置文件中。如
webpack.config.dev.js (开发环境配置)和 webpack.config.prod.js (生产环境配置) 。在项目根目录下创建一个配置文件夹 config 来存放他们。

webpack.config.dev.js 配置如下:

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 抽离CSS
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const toml = require("toml");
const yaml = require("yaml");
const json5 = require("json5");

module.exports = {
  // 配置打包入口，多入口
  entry: {
    index: "./src/index.js",
    another: "./src/another-module.js",
  },

  // 出口
  output: {
    // 指定打包后的文件名
    filename: "scripts/[name].js",
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "../dist"),
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
```

执行如下命令打包：

```shell
npx webpack -c ./config/webpack.config.dev.js
```

webpack.config.prod.js 配置如下:

```js
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

module.exports = {
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
    path: path.resolve(__dirname, "../dist"),
    // 打包清理dist目录
    clean: true,
    // 自定义输出文件名第一种方式，contenthash：根据文件内容生成hash戳，ext：使用原文件的后缀名
    assetModuleFilename: "images/[contenthash][ext]",
    publicPath: "http://localhost:8080/",
  },

  // 指定打包模式，可选项：development | production | none
  mode: "production",

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
```

执行如下命令打包：

```shell
npx webpack -c ./config/webpack.config.prod.js
```

开发环境开启 server 服务：

```shell
npx webpack serve -c ./config/webpack.config.dev.js
```

### 12.4. npm 脚本

每次打包或启动服务时，都需要在命令行里输入一长串的命令。我们将父目录的 package.json、node_modules 与 package-lock.json 拷贝到当前目录下，

配置 npm 脚本来简化命令行的输入，这时可以省略 npx :

```json
{
  "scripts": {
    "start": "webpack serve -c ./config/webpack. config.dev.js",
    "build": "webpack -c ./config/webpack.config. prod.js"
  }
}
```

开发环境运行脚本:

```shell
npm run start
```

```shell
npm run build
```

### 12.5. 提取公共配置

这时，我们发现这两个配置文件里存在大量的重复代码，可以手动的将这些重复的代码单独提取到一个文件里，
创建 webpack.config.common.js，配置公共的内容:

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 抽离CSS
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const toml = require("toml");
const yaml = require("yaml");
const json5 = require("json5");

module.exports = {
  // 配置打包入口，多入口
  entry: {
    index: "./src/index.js",
    another: "./src/another-module.js",
  },

  // 出口
  output: {
    // 指定打包后文件的输出路径，一定是绝对路径
    path: path.resolve(__dirname, "../dist"),
    // 打包清理dist目录
    clean: true,
    // 自定义输出文件名第一种方式，contenthash：根据文件内容生成hash戳，ext：使用原文件的后缀名
    assetModuleFilename: "images/[contenthash][ext]",
  },

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
```

### 12.6. 合并配置文件

配置文件拆分好后，新的问题来了，如何保证配置合并没用问题呢? `webpack-merge` 这个工具可以完美解决这个问题。

安装：

```shell
npm install webpack-merge -D
```

创建 webpack.config.js，合并代码：

```js
const { merge } = require("webpack-merge");

const commonConfig = require("./webpack.config.common");
const productionConfig = require("./webpack.config.prod");
const developmentConfig = require("./webpack.config.dev");

module.exports = (env) => {
  switch (true) {
    case env.development:
      return merge(commonConfig, developmentConfig);
    case env.production:
      return merge(commonConfig, productionConfig);
    default:
      return new Error("No matching configuration was found");
  }
};
```

修改 npm 脚本：

```json
{
  "scripts": {
    "start": "webpack serve -c ./config/webpack.config.js --env development",
    "build": "webpack -c ./config/webpack.config.js --env production"
  }
}
```

# webpack 高级部分

## 01. source-map

作为一个开发工程师一无论是什么开发， 要求开发环境最不可少的一点功能就是-- debug 功能。 之前我们通过
webpack,将我们的源码打包成了 bundle.js。试想:实际上客户端(浏览器)读取的是打包后的 bundle.js ，那
么当浏览器执行代码报错的时候，报错的信息自然也是 bundle 的内容。我们如何将报错信息(bundle 错误的语句及
其所在行列)映射到源码上？是的，souce-map.
webpack 已经内置了 sourcemap 的功能，我们只需要通过简单的配置，将可以开启它。

```js
module.exports = {
  //开启source map
  //开发中推荐使用 'source-map'
  //生产环境一般不开启 sourcemap
  devtool: "source-map",
};
```

当我们执行打包命令之后，我们发现 bundle 的最后一行总是会多出一个注释,指向打包出的 bundle.map.js(sourcemap 文件)。sourcemap 文件 用来描述源码文件和 bundle 文件的代码位置映射关系。基于它，我们将 bundle 文件的错误信息映射到源码文件上。

除了'source-map'外，还可以基于我们的需求设置其他值，webpack--devtool 一共提供了 7 种 SourceMap 模式:
| 模式 | 解释 |
| ---- | ---- |
| eval | 每个 module 会封装到 eval 里包裹起来执行，并且会在末尾追加注释//@ sourceURL. |
| source-map | 生成一个 SourceMap 文件. |
| hidden-source-map | 和 source-map-样，但不会在 bundle 末尾追加注释. |
| inline-source-map | 生成一个 DataUrl 形式的 SourceMap 文件. |
| eval-source-map | 每个 module 会通过 eval()来执行，并且生成一个 DataUrl 形式的 SourceMap. |
| cheap-source-map | 生成一个没有列信息(column-mappings) 的 SourceMaps 文件，不包含 loader 的 sourcemap (譬如 babel 的 sourcemap) |
| cheap-module-source-map | 生成一个没有列信息(column-mappings) 的 SourceMaps 文件， 同时 loader 的 sourcemap 也被简化为只包含对应行的。 |

要注意的是，生产环境我们一般不会开启 sourcemap 功能，主要有两点原因:

1. 通过 bundle 和 sourcemap 文件，可以反编译出源码----也就是说，线上产物有 soucemap 文件的话，就意味着有暴漏源码的风险。
2. 我们可以观察到，sourcemap 文件的体积相对比较巨大，这跟我们生产环境的追求不同(生产环境追求更小更轻量的 bundle)。

> 一道思考题：有时候我们期望能第一时间通过线上的错误信息，来追踪到源码位置，从而快速解决掉 bug 以减轻损失。但又不希望 sourcemap 文件报漏在生产环境，有比较好的方案吗?

## 02. devServer

开发环境下，我们往往需要启动一个 web 服务， 方便我们模拟一个用户从浏览器中访问我们的 web 服务，读取我们的打包产物，以观测我们的代码在客户端的表现。webpack 内置了这样的功能，我们只需要简单的配置就可以开启它。
在此之前，我们需要安装它：

```shell
npm install webpack-dev-server -D
```

devServer.proxy 基于强大的中间件 http-proxy -middleware 实现的，因此它支持很多的配置项，我们基于此,可以做应对绝大多数开发场景的定制化配置。

基础使用：

```js
const path = require("path");

module.exports = {
  //...
  devServer: {
    // 默认把/dist目录当做web服务的根目录
    static: {
      directory: path.join(__dirname, "dist"),
    },
    // 可选择开启gzips压缩功能，对应静态资源请求的响应头里的Content-Encoding: gzip
    compress: true,
    // 端口号
    port: 3000,
  },
};
```

- 添加响应头
  有些场景需求下，我们需要为所有响应添加 headers,来对资源的请求和响应打入标志，以便做一些安全防范,或者方便发生异常后做请求的链路追踪。比如:

```js
// webpack-config
module.exports = {
  //...
  devServer: {
    headers: {
      "X-Fast-Id": "p3fgb42njhm34i9uki",
    },
  },
};
```

这时，在浏览器中右键检查(或者使用 f12 快捷键)，在 Network 一栏查看任意资源访问，我们发现响应头里成功打入
了一个 Fastld。

```
Response Headers
/** some others **/
X-Fast-Id: p3fgb42njhm34i9uki
```

- 开启代理
  我们打包出的 js bundle 里有时会含有一些对特定接口的网络请求(ajax/fetch).要注意，此时客户端地址是在
  http://localhost:3000/下，假设我们的接口来自 http://localhost:4001/ ，那么毫无疑问，此时控制台里会报错并提示你跨域。如何解决这个问题? 在开发环境下，我们可以使用 devServer 自带的 proxy 功能:

```js
module.exports = {
  //...
  devServer: {
    proxy: {
      "/api": "http://localhost:4001",
    },
  },
};
```

现在，对/api/users 的请求会将请求代理到 http://localhost:4001/api/users 。如果不希望传递/api,则需要重写路径:

```js
module.exports = {
  //...
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:4001",
        pathRewrite: {'^/api', ''}
      },
    },
  },
};
```

注意，此时我们访问 http://localhost:port 是无法访问我们的服务的，我们需要在地址栏里加前缀: https: 注意:由
于默认配置使用的是自签名证书，所以有得浏览器会告诉你是不安全的，但我们依然可以继续访问它。当然我们也可以提供自己的证书--如果有的话:

```js
module.exports = {
  //...
  devServer: {
    https: {
      cacert: "./server.pem",
      pfx: "./server.pfx",
      key: "./server.key",
      cert: "./server.crt",
      passphrase: "webpack-dev-server",
      requestCert: true,
    },
  },
};
```

- http2
  如果想要配置 http2，那么直接配置：

```js
devServer: {
  http2: true,
}
```

即可，http2 默认自带 https 自签名证书，当然我们仍然可以通过 https 配置项来使用自己的证书。

- 开发服务器主机
  如果你在开发环境中起了一个 devserve 服务，并期望你的同事能访问到它，你只需要配置:

```js
devServer: {
  host: "0.0.0.0",
}
```

这时候，如果你的同事跟你处在同一局域网下，就可以通过局域网 ip 来访问你的服务啦。

## 03. 模块热替换与热加载

- 模块热替换

> 模块热替换(HMR-hot module replacement)功能会在应用程序运行过程中，替换、添加或删除模块，而无需重新加载整个页面。

启用 webpack 的热模块替换特性，需要配置 devServer.hot 参数:

```js
devServer: {
  hot: true,
}
```

此时我们实现了基本的模块热替换功能。

- HMR 加载样式如果你配置了 style-loader, 那么现在已经同样支持样式文件的热替换功能了。

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

这是因为 style-loader 的实现使用了 module.hot.accept,在 CSS 依赖模块更新之后，会对 style 标签打补丁。从而实现了这个功能。

- 热加载(文件更新时，自动刷新我们的服务和页面)新版的 webpack-dev-server 默认已经开启了热加载的功能。
  它对应的参数是 devServer.liveReload,默认为 true。注意， 如果想要关掉它，要将 liveReload 设置为 false 的同
  时，也要关掉 hot

```js
module.exports = {
  //...
  devServer: {
    liveReload: false, // 默认为true，即开启热更新功能
  },
};
```

## 04. eslint

eslint 是用来扫描我们所写的代码是否符合规范的工具。往往我们的项目是多人协作开发的，我们期望统一的代码规范，这时候可以让 eslint 来对我们进行约束。严格意义上来说,eslint 配置 跟 webpack 无关，但在工程化开发环境中，它往往是不可或缺的。

```shell
yarn add -D eslint
```

配置 eslint,只需要在根目录下添加一个.eslintrc 文件(或者.eslintrc.json, .js 等)。当然， 我们可以使用 eslint 工具来自动生成它:

```shell
npx eslint --init
```

我们可以看到控制台里的展示:

```
wxy@melodyWxydeMacBook-Pro webpack5demo % npx eslint -- init
√ How would you like to use ESLint? ●syntax
√ What type of modules does your project use? ●esm
√ Which framework does your project use? ●react
√ Does your project use TypeScript? ●No / Yes
√ Where does your code run? ●browser
√ What format do you want your config file to be in?.JSON
```

并生成了一个配置文件(.eslintrc.json), 这样我们就完成了 eslint 的基本规则配置。eslint 配置文件 里的配置项含义如下:

1. env 指定脚本的运行环境。每种环境都有一组特定的预定义全局变量。此处使用的 browser 预定义了浏览器环境中的全局变量，es6 启用除了 modules 以外的所有 ECMAScript 6 特性(该选项会自动设置 ecmaVersion解析器选项为 6)。
2. globals 脚本在执行期间访问的额外的全局变量。也就是 env 中未预定义，但我们又需要使用的全局变量。
3. extends 检测中使用的预定义的规则集合。
4. rules 启用的规则及其各自的错误级别，会合并 extends 中的同名规则，定义冲突时优先级更高。
