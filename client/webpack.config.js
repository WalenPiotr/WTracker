const path = require('path');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components')
    .default;
const styledComponentsTransformer = createStyledComponentsTransformer();
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx', '.d.ts'],
        alias: {
            '@styled-components': path.resolve(
                __dirname,
                'src/styled-components',
            ),
            '@interfaces': path.resolve(__dirname, 'src/interfaces/'),
            '@components': path.resolve(__dirname, 'src/components/'),
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                options: {
                    getCustomTransformers: () => ({
                        before: [styledComponentsTransformer],
                    }),
                },
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                ],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './public/index.html',
            filename: './index.html',
        }),
    ],
    devServer: {
        proxy: {
            '/api': 'http://localhost:5000',
        },
    },
};
