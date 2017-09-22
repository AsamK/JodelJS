const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const isProduction = (process.argv.indexOf('-p') !== -1);

const extractText = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: !isProduction
});

module.exports = {
    entry: {
      main: [
        "./src/app/main.tsx",
        "./style/main.less"
      ],
      vendor: [
	"classnames",
        "create-hmac",
        "es5-shim",
        "es6-shim",
        "nprogress",
        "randombytes",
        "react",
        "react-document-title",
        "react-dom",
        "react-redux",
        "redux",
        "redux-freeze",
        "redux-thunk",
        "reselect",
        "superagent",
        "tslib"
      ]
    },

    output: {
        filename: "[name].[chunkhash].js",
        path: __dirname + "/dist"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.css$/,
                use: extractText.extract({
                    use: [{
                        loader: "css-loader",
                        options: {
                            // https://github.com/webpack-contrib/css-loader#importloaders
                            importLoaders: 0
                        }
                    }, {
                        loader: "postcss-loader",
                        options: {
                            plugins: (loader) => [
                                require('autoprefixer')(),
                            ]
                        }
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },
            {
                test: /\.less$/,
                use: extractText.extract({
                    //resolve-url-loader may be chained before less-loader if necessary
                    use: [{
                        loader: "css-loader",
                        options: {
                            // https://github.com/webpack-contrib/css-loader#importloaders
                            importLoaders: 0
                        }
                    }, {
                        loader: "postcss-loader",
                        options: {
                            plugins: (loader) => [
                                require('autoprefixer')(),
                            ]
                        }
                    }, {
                        loader: "less-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            },
            {
                test: /\.svg$/,
                use: {
                    loader: 'svg-url-loader',
                    options: {}
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        extractText,
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor'
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'runtime'
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],

    devServer: {
        inline: true,
        contentBase: "dist"
    }
};
