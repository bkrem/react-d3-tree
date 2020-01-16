module.exports = [
  {
    "type": "directory", "name": ".", "children": [
      { "type": "file", "name": "CHANGELOG.md" },
      { "type": "file", "name": "CODE_OF_CONDUCT.md" },
      { "type": "file", "name": "CONTRIBUTING.md" },
      { "type": "file", "name": "LICENSE" },
      { "type": "file", "name": "README.md" },
      { "type": "file", "name": "appveyor.yml" },
      { "type": "file", "name": "dangerfile.js" },
      {
        "type": "directory", "name": "docs", "children": [
          { "type": "file", "name": "README.md" },
          { "type": "file", "name": "api.md" },
          { "type": "file", "name": "css-we-support.md" },
          { "type": "file", "name": "existing-css.md" },
          { "type": "file", "name": "faq.md" },
          { "type": "file", "name": "flow-support.md" },
          { "type": "file", "name": "react-native.md" },
          { "type": "file", "name": "security.md" },
          { "type": "file", "name": "tagged-template-literals.md" },
          { "type": "file", "name": "theming.md" },
          { "type": "file", "name": "tips-and-tricks.md" },
          { "type": "file", "name": "typescript-support.md" }
        ]
      },
      {
        "type": "directory", "name": "example", "children": [
          { "type": "file", "name": "devServer.js" },
          { "type": "file", "name": "example.js" },
          { "type": "file", "name": "index.html" },
          { "type": "file", "name": "with-perf.html" }
        ]
      },
      {
        "type": "directory", "name": "flow-typed", "children": [
          { "type": "file", "name": "danger-plugin-jest_vx.x.x.js" },
          { "type": "file", "name": "fbjs_vx.x.x.js" },
          { "type": "file", "name": "lodash_v4.x.x.js" },
          {
            "type": "directory", "name": "npm", "children": [
              { "type": "file", "name": "babel-cli_vx.x.x.js" },
              { "type": "file", "name": "babel-core_vx.x.x.js" },
              { "type": "file", "name": "babel-eslint_vx.x.x.js" },
              { "type": "file", "name": "babel-loader_vx.x.x.js" },
              { "type": "file", "name": "babel-plugin-add-module-exports_vx.x.x.js" },
              { "type": "file", "name": "babel-plugin-external-helpers_vx.x.x.js" },
              { "type": "file", "name": "babel-plugin-flow-react-proptypes_vx.x.x.js" },
              { "type": "file", "name": "babel-plugin-transform-class-properties_vx.x.x.js" },
              { "type": "file", "name": "babel-plugin-transform-flow-strip-types_vx.x.x.js" },
              { "type": "file", "name": "babel-plugin-transform-object-rest-spread_vx.x.x.js" },
              { "type": "file", "name": "babel-preset-latest_vx.x.x.js" },
              { "type": "file", "name": "babel-preset-react_vx.x.x.js" },
              { "type": "file", "name": "buffer_vx.x.x.js" },
              { "type": "file", "name": "chokidar_vx.x.x.js" },
              { "type": "file", "name": "css-to-react-native_v1.x.x.js" },
              { "type": "file", "name": "css-to-react-native_vx.x.x.js" },
              { "type": "file", "name": "enzyme_v2.3.x.js" },
              { "type": "file", "name": "eslint-config-airbnb_vx.x.x.js" },
              { "type": "file", "name": "eslint-plugin-flowtype-errors_vx.x.x.js" },
              { "type": "file", "name": "eslint-plugin-flowtype_vx.x.x.js" },
              { "type": "file", "name": "eslint-plugin-import_vx.x.x.js" },
              { "type": "file", "name": "eslint-plugin-jsx-a11y_vx.x.x.js" },
              { "type": "file", "name": "eslint-plugin-react_vx.x.x.js" },
              { "type": "file", "name": "eslint_vx.x.x.js" },
              { "type": "file", "name": "expect_vx.x.x.js" },
              { "type": "file", "name": "express_v4.x.x.js" },
              { "type": "file", "name": "flow-bin_v0.x.x.js" },
              { "type": "file", "name": "flow-copy-source_vx.x.x.js" },
              { "type": "file", "name": "inline-style-prefixer_vx.x.x.js" },
              { "type": "file", "name": "is-function_vx.x.x.js" },
              { "type": "file", "name": "is-plain-object_vx.x.x.js" },
              { "type": "file", "name": "jest_v19.x.x.js" },
              { "type": "file", "name": "jsdom_vx.x.x.js" },
              { "type": "file", "name": "lint-staged_vx.x.x.js" },
              { "type": "file", "name": "mocha-jsdom_vx.x.x.js" },
              { "type": "file", "name": "mocha_v2.4.x.js" },
              { "type": "file", "name": "mocha_v3.1.x.js" },
              { "type": "file", "name": "node-watch_vx.x.x.js" },
              { "type": "file", "name": "pre-commit_vx.x.x.js" },
              { "type": "file", "name": "react-addons-test-utils_v15.x.x.js" },
              { "type": "file", "name": "rollup-plugin-babel_vx.x.x.js" },
              { "type": "file", "name": "rollup-plugin-commonjs_vx.x.x.js" },
              { "type": "file", "name": "rollup-plugin-flow_vx.x.x.js" },
              { "type": "file", "name": "rollup-plugin-inject_vx.x.x.js" },
              { "type": "file", "name": "rollup-plugin-json_vx.x.x.js" },
              { "type": "file", "name": "rollup-plugin-node-resolve_vx.x.x.js" },
              { "type": "file", "name": "rollup-plugin-replace_vx.x.x.js" },
              { "type": "file", "name": "rollup-plugin-uglify_vx.x.x.js" },
              { "type": "file", "name": "rollup-plugin-visualizer_vx.x.x.js" },
              { "type": "file", "name": "rollup_vx.x.x.js" },
              { "type": "file", "name": "supports-color_v3.x.x.js" }
            ]
          },
          { "type": "file", "name": "react-native.js" }
        ]
      },
      {
        "type": "directory", "name": "native", "children": [
          { "type": "file", "name": "index.d.ts" },
          { "type": "file", "name": "index.js" }
        ]
      },
      { "type": "file", "name": "no-parser.js" },
      { "type": "file", "name": "package.json" },
      {
        "type": "directory", "name": "primitives", "children": [
          { "type": "file", "name": "index.d.ts" },
          { "type": "file", "name": "index.js" }
        ]
      },
      { "type": "file", "name": "rollup.config.js" },
      {
        "type": "directory", "name": "src", "children": [
          {
            "type": "directory", "name": "constructors", "children": [
              { "type": "file", "name": "constructWithOptions.js" },
              { "type": "file", "name": "css.js" },
              { "type": "file", "name": "injectGlobal.js" },
              { "type": "file", "name": "keyframes.js" },
              { "type": "file", "name": "styled.js" },
              {
                "type": "directory", "name": "test", "children": [
                  { "type": "file", "name": "injectGlobal.test.js" },
                  { "type": "file", "name": "keyframes.test.js" },
                  { "type": "file", "name": "styled.test.js" }
                ]
              }
            ]
          },
          {
            "type": "directory", "name": "hoc", "children": [
              { "type": "file", "name": "withTheme.js" }
            ]
          },
          { "type": "file", "name": "index.js" },
          {
            "type": "directory", "name": "models", "children": [
              { "type": "file", "name": "BrowserStyleSheet.js" },
              { "type": "file", "name": "ComponentStyle.js" },
              { "type": "file", "name": "InlineStyle.js" },
              { "type": "file", "name": "ServerStyleSheet.js" },
              { "type": "file", "name": "StyleSheet.js" },
              { "type": "file", "name": "StyleSheetManager.js" },
              { "type": "file", "name": "StyledComponent.js" },
              { "type": "file", "name": "StyledNativeComponent.js" },
              { "type": "file", "name": "ThemeProvider.js" },
              {
                "type": "directory", "name": "test", "children": [
                  { "type": "file", "name": "ThemeProvider.test.js" }
                ]
              }
            ]
          },
          {
            "type": "directory", "name": "native", "children": [
              { "type": "file", "name": "index.js" },
              {
                "type": "directory", "name": "test", "children": [
                  { "type": "file", "name": "native.test.js" }
                ]
              }
            ]
          },
          {
            "type": "directory", "name": "no-parser", "children": [
              { "type": "file", "name": "css.js" },
              { "type": "file", "name": "flatten.js" },
              { "type": "file", "name": "index.js" },
              { "type": "file", "name": "stringifyRules.js" },
              {
                "type": "directory", "name": "test", "children": [
                  { "type": "file", "name": "basic.test.js" },
                  { "type": "file", "name": "flatten.test.js" },
                  { "type": "file", "name": "keyframes.test.js" }
                ]
              }
            ]
          },
          {
            "type": "directory", "name": "primitives", "children": [
              { "type": "file", "name": "index.js" },
              {
                "type": "directory", "name": "test", "children": [
                  { "type": "file", "name": "primitives.test.js" }
                ]
              }
            ]
          },
          {
            "type": "directory", "name": "test", "children": [
              {
                "type": "directory", "name": "__snapshots__", "children": [
                  { "type": "file", "name": "ssr.test.js.snap" }
                ]
              },
              { "type": "file", "name": "attrs.test.js" },
              { "type": "file", "name": "basic.test.js" },
              { "type": "file", "name": "css.test.js" },
              { "type": "file", "name": "expanded-api.test.js" },
              { "type": "file", "name": "extending.test.js" },
              { "type": "file", "name": "overriding.test.js" },
              { "type": "file", "name": "props.test.js" },
              { "type": "file", "name": "rehydration.test.js" },
              { "type": "file", "name": "ssr.test.js" },
              { "type": "file", "name": "staticCaching.test.js" },
              { "type": "file", "name": "styles.test.js" },
              { "type": "file", "name": "theme.test.js" },
              { "type": "file", "name": "utils.js" },
              { "type": "file", "name": "warnTooManyClasses.test.js" }
            ]
          },
          { "type": "file", "name": "types.js" },
          {
            "type": "directory", "name": "utils", "children": [
              { "type": "file", "name": "create-broadcast.js" },
              { "type": "file", "name": "createWarnTooManyClasses.js" },
              { "type": "file", "name": "determineTheme.js" },
              { "type": "file", "name": "domElements.js" },
              { "type": "file", "name": "extractCompsFromCSS.js" },
              { "type": "file", "name": "flatten.js" },
              { "type": "file", "name": "generateAlphabeticName.js" },
              { "type": "file", "name": "getComponentName.js" },
              { "type": "file", "name": "interleave.js" },
              { "type": "file", "name": "isStyledComponent.js" },
              { "type": "file", "name": "isTag.js" },
              { "type": "file", "name": "nonce.js" },
              { "type": "file", "name": "once.js" },
              { "type": "file", "name": "stringifyRules.js" },
              {
                "type": "directory", "name": "test", "children": [
                  { "type": "file", "name": "determineTheme.test.js" },
                  { "type": "file", "name": "extractCompsFromCSS.test.js" },
                  { "type": "file", "name": "flatten.test.js" },
                  { "type": "file", "name": "generateAlphabeticName.test.js" },
                  { "type": "file", "name": "interleave.test.js" },
                  { "type": "file", "name": "validAttr.test.js" }
                ]
              },
              { "type": "file", "name": "validAttr.js" }
            ]
          },
          {
            "type": "directory", "name": "vendor", "children": [
              { "type": "file", "name": "README.md" },
              {
                "type": "directory", "name": "glamor", "children": [
                  { "type": "file", "name": "hash.js" }
                ]
              },
              {
                "type": "directory", "name": "postcss", "children": [
                  { "type": "file", "name": "at-rule.js" },
                  { "type": "file", "name": "comment.js" },
                  { "type": "file", "name": "container.js" },
                  { "type": "file", "name": "css-syntax-error.js" },
                  { "type": "file", "name": "declaration.js" },
                  { "type": "file", "name": "input.js" },
                  { "type": "file", "name": "lazy-result.js" },
                  { "type": "file", "name": "list.js" },
                  { "type": "file", "name": "node.js" },
                  { "type": "file", "name": "parse.js" },
                  { "type": "file", "name": "parser.js" },
                  { "type": "file", "name": "postcss.js" },
                  { "type": "file", "name": "processor.js" },
                  { "type": "file", "name": "result.js" },
                  { "type": "file", "name": "root.js" },
                  { "type": "file", "name": "rule.js" },
                  { "type": "file", "name": "stringifier.js" },
                  { "type": "file", "name": "stringify.js" },
                  { "type": "file", "name": "terminal-highlight.js" },
                  { "type": "file", "name": "tokenize.js" },
                  { "type": "file", "name": "vendor.js" },
                  { "type": "file", "name": "warn-once.js" },
                  { "type": "file", "name": "warning.js" }
                ]
              },
              {
                "type": "directory", "name": "postcss-nested", "children": [
                  { "type": "file", "name": "index.js" }
                ]
              },
              {
                "type": "directory", "name": "postcss-safe-parser", "children": [
                  { "type": "file", "name": "parse.js" },
                  { "type": "file", "name": "safe-parser.js" }
                ]
              }
            ]
          }
        ]
      },
      { "type": "file", "name": "test-results.json" },
      { "type": "file", "name": "tslint.json" },
      {
        "type": "directory", "name": "typings", "children": [
          { "type": "file", "name": "styled-components.d.ts" },
          {
            "type": "directory", "name": "tests", "children": [
              { "type": "file", "name": "attrs-test.tsx" },
              { "type": "file", "name": "extend-test.tsx" },
              { "type": "file", "name": "function-themes-test.tsx" },
              { "type": "file", "name": "hoc-test.tsx" },
              { "type": "file", "name": "issue1068.tsx" },
              { "type": "file", "name": "main-test.tsx" },
              { "type": "file", "name": "native-test.tsx" },
              { "type": "file", "name": "nested-test.tsx" },
              { "type": "file", "name": "server-test.tsx" },
              { "type": "file", "name": "string-tags-test.tsx" },
              {
                "type": "directory", "name": "themed-tests", "children": [
                  { "type": "file", "name": "issue1068.tsx" },
                  { "type": "file", "name": "mytheme-styled-components.tsx" },
                  { "type": "file", "name": "mytheme-test.tsx" },
                  { "type": "file", "name": "with-theme-test.tsx" }
                ]
              },
              { "type": "file", "name": "tsconfig.json" },
              { "type": "file", "name": "with-component-test.tsx" },
              { "type": "file", "name": "with-theme-test.tsx" }
            ]
          }
        ]
      },
      { "type": "file", "name": "yarn.lock" }
    ]
  },
  { "type": "report", "directories": 30, "files": 202 }
]
