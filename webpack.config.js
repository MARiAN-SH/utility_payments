// const path = require("path");

const config = {
    mode: "production",
    entry: {
        main: "./app/js/dev/main.js",
        calendar: "./app/js/dev/calendar.js",
    },
    output: {
        filename: "[name].min.js",
        // path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
};

module.exports = config;
