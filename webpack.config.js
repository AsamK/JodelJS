const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = (process.argv.indexOf('-p') !== -1);

const extractText = new ExtractTextPlugin({
//    filename: "[name].[contenthash].css",
    filename: 'main.css',
    disable: !isProduction
});

module.exports = {
    entry: "./src/app/main.tsx",
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
                loader: 'svg-inline-loader?classPrefix'
            }
        ]
    },
    plugins: [
        extractText,
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],

    devServer: {
        inline: true,
        contentBase: "dist"
    }
};
