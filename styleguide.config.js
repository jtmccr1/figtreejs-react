module.exports = {
  components: 'src/components/**/*.js',
  sections:[
    {
      name:"FigTree",
      components: "src/components/*.js"
    },

    {
      name:"Baubles",
      components: "src/components/Baubles/*.js"
    },
    {name: 'Basic SVG components',
      components: 'src/components/svgElements/*.js'},

    ],
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: "babel-loader"
        }
      ]
    }
  },
};
