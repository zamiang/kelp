module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: {
          browsers: ["last 2 Chrome versions"],
        },
      },
    ],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  plugins: ["lodash"],
};
