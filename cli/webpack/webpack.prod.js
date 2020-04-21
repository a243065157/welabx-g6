/**
 * @author claude
 * date 07/05/2019
 * webpack 生产配置
 * ! 所有配置都可以通过外部配置文件覆盖
 */

const boxen = require('boxen');
const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const WebpackMerge = require('webpack-merge');
// 默认编译 prod
const STAGE = (JSON.parse(process.env.npm_config_argv).cooked[2] || 'prod').replace(/(-|--)/,'');
const { coreConfig, userConfig } = require('./webpack.common');
// const env = {};

console.log(boxen(`当前运行环境为 ${STAGE}`,
    {
        margin: 1,
        padding: 2,
        float: 'center',
        borderColor: 'green',
        borderStyle: 'round',
    }
));

coreConfig
    // 注入环境变量
    .plugin('definePlugin')
        .use(dotenvWebpack, {
            path: `${process.env.INIT_CWD}/.env`,
            defaults: false,
            systemvars: true,
            silent: true,
        })
        .end()
    .plugin('extra-css')
        .use(MiniCssExtractPlugin, [{
            filename:      `${userConfig.assetsDir || 'static'}/css/[name].[hash:7].css`,
            chunkFilename: `${userConfig.assetsDir || 'static'}/css/[id].[hash:7].css`,
        }])
        .end()
    .plugin('clean')
        .use(CleanWebpackPlugin, [{
            cleanOnceBeforeBuildPatterns: ['**/*', '!**/lib/**'],
        }])
        .end()
    .plugin('hashedModule')
        .use(webpack.HashedModuleIdsPlugin)
        .end()
    .plugin('hardSource')
        .use(HardSourceWebpackPlugin)
        .end()

coreConfig.optimization
    .minimizer('optimizeCSS')
        .use(OptimizeCSSAssetsPlugin, [{
            cssProcessor:        require('cssnano'),
            cssProcessorOptions: {
                discardComments: { removeAll: true },
            },
        }])
        .end()
    /* .minimizer('terser')
        .use(TerserJSPlugin, [{
            terserOptions: {
                warnings: false,
                output: {
                    comments: false,
                },
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                },
                // 使用用户配置覆盖默认配置
                ...userConfig.terserOptions,
            },
            sourceMap: Boolean(userConfig.sourceMap !== undefined ? userConfig.sourceMap : false),
            parallel: userConfig.parallel || true,
        }])
        .end() */
    .splitChunks({
        name: true,
        chunks: 'all', // 从哪些chunks里面抽取代码
        minChunks: 2, // 最少引用次数
        minSize: 30000, // 表示抽取出来的文件在压缩前的最小体积，默认为 30000
        maxAsyncRequests: 5, // 最大的按需加载次数
        maxInitialRequests: 3, // 最大的初始化加载次数
        automaticNameDelimiter: '~',
        cacheGroups: {
            vendors: {
                // 第三方依赖
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                chunks: 'initial',
                minSize: 100,
                minChunks: 1 //重复引入了几次
            },
            default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
            },
        },
    });

/** 执行 webpackChain方法
 * 使用外部用户配置覆盖默认配置
*/
if (userConfig.webpackChain) {
    userConfig.webpackChain(coreConfig);
}

const finalConfig = coreConfig.toConfig();

// 临时解决element-ui 样式问题
module.exports = WebpackMerge(finalConfig, {
    module: {
        rules: [{
            test: /\.(sc|c)ss$/,
            use:  [
                'style-loader',
                { loader: MiniCssExtractPlugin.loader },
                'css-loader',
                'postcss-loader',
                {
                    loader:  'sass-loader',
                    options: {
                        implementation: require('dart-sass'),
                    },
                },
            ],
            exclude: [/node_modules/],
        }, {
            test:    /\.js$/,
            use:     ['cache-loader', 'babel-loader'],
            exclude: [/node_modules/],
        }, {
            test: /\.(png|jpe?g|svg|gif)$/i,
            use:  [{
                loader:  'url-loader',
                options: {
                    limit: 8192,    // 8k
                    name:  'images/[name].[hash:7].[ext]',
                },
            }],
            exclude: [],
        }, {
            test: /\.(eot|woff|woff2|ttf)$/i,
            use:  [{
                loader:  'url-loader',
                options: {
                    limit: 8192,    // 8k
                    name:  'fonts/[name].[hash:7].[ext]',
                },
            }],
            exclude: [],
        }, {
            test:    /element-ui\/.*?js$/,
            loader:  ['cache-loader', 'babel-loader'],
            exclude: [/node_modules/],
        }, {
            test: /node_modules\/.*?css$/,
            use:  [{
                    loader:  MiniCssExtractPlugin.loader,
                    options: {
                        hmr: true,
                    },
                },
                'css-loader',
                'postcss-loader',
            ],
        }, {
            test:    /\.vue$/,
            loader:  'vue-loader',
            exclude: [],
        }]
    },
    plugins: [
        new TerserJSPlugin({
            terserOptions: {
                warnings: false,
                output:   {
                    comments: false,
                },
                compress: {
                    drop_console:  true,
                    drop_debugger: true,
                },
            },
            sourceMap: false,
            parallel:  true,
        }),
    ]
});
