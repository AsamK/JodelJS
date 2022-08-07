const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = function (env, argv) {
    const isProduction = argv.mode === 'production';
    const createSourceMaps = !isProduction;

    return {
        output: {
            filename: isProduction ? '[name].[contenthash].js' : '[name].js',
            path: __dirname + '/dist',
            publicPath: isProduction ? '' : undefined,
        },

        // Enable sourcemaps for debugging webpack's output.
        devtool: createSourceMaps && 'source-map',

        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ['.ts', '.tsx', '.js', '.json'],
            mainFields: ['browser', 'module', 'jsnext:main', 'main'],
        },

        module: {
            rules: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    type: isProduction ? 'javascript/esm' : 'javascript/auto', // hotloading needs commonjs enabled
                },
                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader',
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    type: 'asset',
                },
                {
                    test: /\.s?css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        { loader: 'css-loader', options: { sourceMap: createSourceMaps } },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [require.resolve('autoprefixer')],
                                },
                                sourceMap: createSourceMaps,
                            },
                        },
                        { loader: 'sass-loader', options: { sourceMap: createSourceMaps } },
                    ],
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'html-loader',
                            options: { minimize: isProduction },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/index.html',
            }),
            new CopyWebpackPlugin({
                patterns: ['src/manifest.webmanifest'],
            }),
            ...(isProduction
                ? [
                      new CleanWebpackPlugin(),
                      new MiniCssExtractPlugin({
                          filename: isProduction ? '[name].[contenthash].css' : '[name].css',
                      }),
                      new InjectManifest({
                          swSrc: './src/sw.ts',
                          swDest: 'sw.js',
                      }),
                  ]
                : []),
        ],
        optimization: {
            splitChunks: {
                chunks: 'all',
            },
            runtimeChunk: true,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        sourceMap: createSourceMaps,
                    },
                }),
                new CssMinimizerPlugin(),
            ],
        },

        devServer: {
            static: false,
        },
    };
};
