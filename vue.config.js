const webpackConfig = require('./webpack-config/config.js');
const path = require('path');

module.exports = {
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  lintOnSave: true,
  publicPath: './',
  productionSourceMap: false,
  //runtimeCompiler: false,
  devServer: {
    host: '0.0.0.0',
    port: 7777,
    open: false,
    //compress: true,
    publicPath: '/',  // 设置的dev静态资源目录 如 '/xx/',
    /*proxy: {
      '^/user/!*': {
        changeOrigin: true,
        ws: true,
        target: 'http://192.168.57.7:6066/mock/332',
        pathRewrite: {
          '^/data-search': '/'
        }
      },
      '/login': {
        changeOrigin: true,
        ws: true,
        target: 'http://192.168.57.7:6066/mock/41',
        pathRewrite: {
          '^/data-search': '/'
        }
      }
    }*/
  },

  // transpileDependencies: ['v-fly-event-bus', 'v-fly-auto-complete'],

  chainWebpack: config => {
    config.module
      .rule('js')
      .include
      .add(path.join(__dirname, 'packages'))
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        // 修改它的选项...
        return options
      });

    config.resolve.alias
      .set('@', path.join(__dirname, 'examples'))
      .set('packages', path.join(__dirname, 'packages'));
  },
  /*chainWebpack: () => {
    config.plugin('define').tap(args => {
      const argv = process.argv
      const mode = argv[argv.indexOf('--project-mode') + 1]
      args[0]['process.env'].MODE = `"${mode}"`
      args[0]['process.env'].BASE_API = '"http://editor-api.eloco.cn"'
      console.error('argv', argv)
      console.error('args >>>', args)
      return args
    })
  },*/

  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
    return webpackConfig;
  },
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          red: '#03a9f4',
          blue: '#3eaf7c',
          orange: '#f08d49',
          'text-color': '#111'
        }
      },
      sass: {
        data: `@import "packages/common/styles/packages.variable.scss";`
      }
    },
    modules:false,
    extract: false,//不抽离css
    sourceMap:false
  }

};
