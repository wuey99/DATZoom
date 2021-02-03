const path = require('path');
const webpack = require('webpack');
const args = process.argv.slice(2);
const https = args[2] === '--https' && args[3] === 'true';
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
    devtool: 'eval',
    entry: {
        index: [
            './src/scripts/index.js'
        ],
        meeting: [
            './src/scripts/meeting.js'
        ]
    },
    output: {
        path: path.resolve(__dirname, '/static'),
        publicPath: '/static',
        hashDigestLength: 5,
        // filename: `zoom-meeting-${buildVersion}-[name]-[chunkhash].min.js`,
        filename: '[name].min.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'url-loader?limit=500000'
            },
            {
                test: /\.(ttf|eot|woff|woff2|svg)$/,
                loader: 'url-loader?limit=50000'
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    externals: {
        'babel-polyfill': 'babel-polyfill',
        react: 'React',
        'react-dom': 'ReactDOM',
        redux: 'Redux',
        'redux-thunk': 'ReduxThunk',
        lodash: {
            commonjs: 'lodash',
            amd: 'lodash',
            root: '_',
            var: '_'
        }
    },
    context: __dirname,
    target: 'web',
    devServer: {
        https,
        cert: './localhost.crt',
        key: './localhost.key',
        host: '0.0.0.0',
        port: 9999,
        hot: true,
        overlay: true,
        historyApiFallback: false,
        watchContentBase: true,
        disableHostCheck: true,
        headers: {
            'Access-Control-Allow-Origin': https ? 'https://0.0.0.0:9999' : 'http://0.0.0.0:9999'
        }
    },
    mode: 'development',
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin([
            { from: 'src/index.html' },
            { from: 'src/css/style.css', to: 'css/' },
            { from: 'src/assets/images', to: 'images' },
            { from: 'src/assets/audio', to: 'audio' },
            { from: 'src/assets/Cows/Project', to: 'assets' },
        ]),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.BABEL_ENV': JSON.stringify('development'),
        })
    ],
};
