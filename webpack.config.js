module.exports = {
    entry:['./js/utils.js', './js/actions.js', './js/store.js', './js/components.jsx.js'],
    output:{
        filename: './dist/bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx.js$/,
                loader: 'jsx-loader?insertPragma=React.DOM&harmony'
            }
        ]
    },
    externals: {
        'react': 'React'
    }
};