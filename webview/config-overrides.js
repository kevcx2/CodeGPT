const webpack = require('webpack');
module.exports = function override(config, env) {
    config.resolve.fallback = {
        url: require.resolve('url'),
        fs: false,
        path: require.resolve('path-browserify'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        // react-markdown has a dep on the uvu package, which has
        // a dep on the kleur package which uses process and still has
        // compilation errors despite providing the browser/process fallback.
        // I did not have time to figure out the proper fix, so in order
        // to run this off a fresh install, you'll need to npm i, and then
        // remove the process references inside node_modules/uvu/node_modules/kleur/.
        process: require.resolve('process/browser'),
        uvu: false,
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    );
    config.resolve.extensions = ['.js', '.mjs', '.json', '.jsx', '.css'];

    return config;
}
