import path from 'path';

export default {
    entry: './app/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(process.cwd(), 'dist'), // __dirname n'existe pas en ESM, utilise process.cwd()
    },
    mode: 'development',

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'assets/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },

    resolve: {
        extensions: ['.js', '.scss'],
    },
};
