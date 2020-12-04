module.exports = {
  "presets": [
    [
       //'@vue/app',
       //{
       // useBuiltIns: 'entry'
       //},
      "@babel/preset-env",
      {
        "modules": false,
        "targets": {
          "browsers": [
            "> 1%",
            "last 2 versions",
            "not ie <= 8"
          ],
          "node": "current"
        }
      }
      // "@babel/preset-env", {
      //   "modules": false,
      //   "targets": {
      //     "browsers": ["ie >=9"]
      //   },
      //   "useBuiltIns": true,
      //   "debug": true
      // }
    ]

  ],
  'plugins': [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-class-properties",
    [
      'transform-imports',
      {
        'zyzl-components\/?((([\\w-]*)?\/?)*)': {
          transform: function (importName, matches) {
            if (matches.length > 2 && matches[1]) {
              return `zyzl-components/dist/components/${matches[1]}/${importName}`
            }
    
            return `zyzl-components/dist/components/${importName}`
          },
          'preventFullImport': false,
          'kebabCase': true
        }
      }
    ]
    
  ]
}
