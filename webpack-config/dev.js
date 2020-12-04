module.exports = {
  devtool: '#source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {transpileOnly: true, appendTsxSuffixTo: [/\.vue$/]}
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue', '.ts']
  }
};
