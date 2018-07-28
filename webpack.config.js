const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = function (env, argv) {
    const isProduction = argv.mode === 'production';

    return {
        output: {
            filename: isProduction ? '[name].[contenthash].js' : '[name].js',
            path: __dirname + '/dist'
        },

        // Enable sourcemaps for debugging webpack's output.
        devtool: 'source-map',

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
                    //                type: 'javascript/esm', // Disabled, until #6913 is resolved
                },

                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader'
                },
                {
                    test: /\.(png|jpg|gif)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {}
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: (loader) => [
                                    require('autoprefixer')(),
                                ]
                            }
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: (loader) => [
                                    require('autoprefixer')(),
                                ]
                            }
                        },
                        'sass-loader',
                    ],
                },
                {
                    test: /\.svg$/,
                    use: {
                        loader: 'svg-url-loader',
                        options: {}
                    }
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'html-loader',
                            options: { minimize: true }
                        }
                    ]
                },
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/index.html'
            }),
            new CopyWebpackPlugin([
                'src/manifest.webmanifest'
            ]),
            ...(isProduction ?
                [
                    new CleanWebpackPlugin(['dist']),
                    new MiniCssExtractPlugin({
                        filename: '[name].css',
                        chunkFilename: '[name].[contenthash].css'
                    }),
                    new webpack.HashedModuleIdsPlugin(),
                ] : [
                    new webpack.HotModuleReplacementPlugin()
                ]),
        ],
        optimization: {
            splitChunks: {
                chunks: 'all',
            },
            runtimeChunk: true,
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true // set to true if you want JS source maps
                }),
                new OptimizeCSSAssetsPlugin({})
            ]
        },

        devServer: {
            inline: true,
            contentBase: 'dist',
            hot: true,
        }
    }
}

