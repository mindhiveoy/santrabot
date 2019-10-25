module.exports.typescriptRule = tsconfig => {
  console.info(`Using tsconfig file: ${tsconfig}`);
  return {
    // Exclude test files from package
    test: /\.tsx?$/,
    use: [
      {
        // loader: 'ts-loader',
        // options: {
        //   transpileOnly: true,
        // },
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: tsconfig || '../tsconfig.json',
        },
      },
    ],
    exclude: /node_modules/,
  };
};

module.exports.svgRule = {
  test: /\.svg$/i,
  loaders: [
    'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]',
    'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false',
  ],
};

module.exports.imageRule = {
  test: /\.(jpe?g|png)$/i,
  loader: 'responsive-loader',
  options: {
    // If you want to enable sharp support:
    // adapter: require('responsive-loader/sharp'),
  },
};

module.exports.cssRule = {
  test: /\.css$/,
  use: ['style-loader', 'css-loader', 'postcss-loader'],
};

module.exports.fontRule = {
  test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
  use: {
    loader: 'file-loader',
    options: {
      // Output below fonts directory
      name: './fonts/[name].[ext]',
    },
  },
};

module.exports.imageRule = {
  test: /\.(jpe?g|png)$/i,
  loader: 'responsive-loader',
  options: {
    // adapter: require('responsive-loader/sharp'),
  },
};
