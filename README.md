# style-loader-dynamic-theme

[![MIT License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=plastic)](http://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/badge/npm-v1.0.0-green.svg?style=plastic)](https://www.npmjs.com/package/style-loader-dynamic-theme)

This packages allows to manage style files and load them dynamicly with style-loader usable feature dynamic loading less, css, scss as needed on demand, this package works with any framework and will service as core feature for react, vue, angular tecnologies this package only uses typescript and its compile to es5 javascript for compatibility

## Installation

### Install via NPM

```bash
npm install style-loader-dynamic-theme
```

Requires only `style-loader` as [`peerDependency`](https://docs.npmjs.com/files/package.json#peerdependencies)

```bash
npm install --save-dev style-loader
```

### styler-loader config

This option on style-loader must be added `injectType: "lazyStyleTag"` it will load files with on demand option and make able to load styles on demand.

Read more here:  
https://github.com/webpack-contrib/style-loader#lazystyletag

Example:

```javascript
{
  loader: "style-loader",
  options: {
    injectType: "lazyStyleTag"
  }
},
```

# Usage

## Example with react (it works with any framework)

```javascript
// sample.js
import ThemeManager from "style-loader-dynamic-theme";
import { useEffect } from "react";
import lightTheme from "./lightTheme.lazy.less";
import darkTheme from "./darkTheme.lazy.less";

export function App(props) {
  useEffect(() => {
    // mount light theme as default
    const themeManager = new ThemeManager({
      currentTheme: "light",
      themeData: {
        dark: darkTheme,
        light: lightTheme,
      },
    });

    // test change theme after 10 seconds
    setTimeout(() => {
      // change to dark theme
      // light theme will be removed and dark loaded
      themeManager.switchTheme("dark");
    }, 10000);
  }, []);

  return <div classname="container">hi there</div>;
}
```

```less
// darkTheme.lazy.less
.container {
  background-color: black;
  color: white;
}
```

```less
// lightTheme.lazy.less
.container {
  background-color: white;
  color: black;
}
```

### Webpack example configuration for less files

```javascript
// webpack.config.js
{
      test: /\.lazy\.less$/,
      use: [
        {
          loader: "style-loader",
          options: {
            injectType: "lazyStyleTag"
          }
        },
        {
          loader: "css-loader",
        },
        {
          loader: "less-loader",
          options: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    }
```

#### With react-scripts + craco + less

```javascript
// craco.config.js

module.exports = {
  webpack: {
    configure: (config) => {
      const oneOfRule = config.module.rules.find((rule) => rule.oneOf);

      const lazyLessRule = {
        test: /\.lazy\.less$/,
        use: [
          {
            loader: require.resolve("style-loader"),
            options: {
              injectType: "lazyStyleTag",
            },
          },
          {
            loader: require.resolve("css-loader"),
          },
          {
            loader: require.resolve("less-loader"),
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      };

      // https://github.com/facebook/create-react-app/blob/9673858a3715287c40aef9e800c431c7d45c05a2/packages/react-scripts/config/webpack.config.js#L590-L596

      // insert less loader before resource loader
      // https://webpack.js.org/guides/asset-modules/
      const resourceLoaderIndex = oneOfRule.oneOf.findIndex(
        ({ type }) => type === "asset/resource"
      );
      oneOfRule.oneOf.splice(resourceLoaderIndex, 0, lazyLessRule);

      return config;
    },
  },
};
```

# License

MIT License
