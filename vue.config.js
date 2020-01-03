// vue.config.js
module.exports = {
    configureWebpack: {
        optimization: {
            splitChunks: false
        }
    },

    css: {
        extract: false,
    },

    publicPath: '.',
    outputDir: 'docs', // this is because github doesnt let us configure the github-pages path
    assetsDir: 'images'
}