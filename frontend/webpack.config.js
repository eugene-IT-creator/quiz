// Подключаем нужные модули через переменные
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/app.js',
    mode: 'development',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // чтобы при сборке созданные файлы в папке dist перезаписывались на новые
    },
    // Сервер Webpack
    devServer: {
        static: '.dist',
        compress: true,
        port: 9000,
    },
    plugins: [new HtmlWebpackPlugin({
        template: './index.html'
    }),
        new CopyPlugin({
            patterns: [
                { from: "templates", to: "templates" },
                { from: "styles", to: "styles" },
                { from: "static/fonts", to: "fonts" },
                { from: "static/images", to: "images" },
            ],
        }),
    ],
    // module: {
    //     rules: [
    //         {
    //             test: /\.js$/,
    //             exclude: /node_modules/,
    //             use: {
    //                 loader: 'babel-loader',
    //                 options: {
    //                     targets: "defaults",
    //                     presets: [
    //                         ['@babel/preset-env']
    //                     ]
    //                 }
    //             }
    //         }
    //     ]
    // }
};