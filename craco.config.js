const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    webpack: {
        plugins: {
            add: [
                new NodePolyfillPlugin(),
                new webpack.ProvidePlugin({
                    process: require.resolve('process/browser.js'),
                    Buffer: [require.resolve('buffer/'), 'Buffer'],
                }),
            ],
        },
        configure: (webpackConfig) => {
            // 1. Resolve polyfills for browser environments
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                process: require.resolve("process/browser.js"),
                fs: false,
                path: require.resolve("path-browserify"),
                stream: require.resolve("stream-browserify"),
                buffer: require.resolve("buffer/"),
                http: require.resolve("stream-http"),
                https: require.resolve("https-browserify"),
                util: require.resolve("util/"),
                url: require.resolve("url/"),
                os: require.resolve("os-browserify/browser"),
                constants: require.resolve("constants-browserify"),
                vm: require.resolve("vm-browserify"),
                zlib: require.resolve("browserify-zlib"),
                module: false,
                net: false,
                tls: false,
                child_process: false,
            };

            // 2. Ensure ESM modules don't fail on fully specified imports
            webpackConfig.module.rules.push({
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            });

            // 3. Fix for libraries like canvg/pdfjs that might have issues with strict ESM
            webpackConfig.module.rules.push({
                test: /(pdf\.mjs|canvg|pdf\.js|pdf\.worker)/,
                type: "javascript/auto",
            });

            // 3. NormalModuleReplacementPlugin to handle internal node: scheme imports in libraries
            webpackConfig.plugins.push(
                new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
                    if (resource.request) {
                        resource.request = resource.request.replace(/^node:/, "");
                    }
                })
            );

            // 4. Explicit aliasing for the node: scheme issues
            webpackConfig.resolve.alias = {
                ...webpackConfig.resolve.alias,
                "process/browser": require.resolve("process/browser.js"),
                "process/browser.js": require.resolve("process/browser.js"),
                "node:fs": false,
                "node:https": require.resolve("https-browserify"),
                "node:http": require.resolve("stream-http"),
                "node:path": require.resolve("path-browserify"),
                "node:stream": require.resolve("stream-browserify"),
                "node:util": require.resolve("util/"),
                "node:url": require.resolve("url/"),
                "node:os": require.resolve("os-browserify/browser"),
                "node:buffer": require.resolve("buffer/"),
                "node:zlib": require.resolve("browserify-zlib"),
                "node:constants": require.resolve("constants-browserify"),
                "node:vm": require.resolve("vm-browserify"),
            };

            return webpackConfig;
        },
    },
    devServer: (devServerConfig) => {
        devServerConfig.headers = {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        };
        return devServerConfig;
    },
};
