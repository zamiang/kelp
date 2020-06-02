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
  plugins: [
    "lodash",
    "const-enum",
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
  ],
};
