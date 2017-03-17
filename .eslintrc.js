module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "globals": {
      'require': false,
      "module": false,
      "process": false,
      "__dirname": false
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-console": "warn",
        "quotes": [
            "error",
            "double"
        ],
        "react/jsx-uses-vars": [2],
        "semi": [
            "error",
            "never"
        ]
    }
};
