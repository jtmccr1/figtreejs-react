module.exports = {
  components: 'src/components/**/*.js',
  sections:[
    {
      name:"FigTree",
      components: "src/components/*.js",
      ignore:"src/components/Figure.js"
    },

    {
      name:"Baubles",
      components: "src/components/Baubles/*.js"
    },
    {
      name:"Decorations",
      components: "src/components/decorations/*.js",
      sections:[
        {
          name:"Legends",
          components: "src/components/decorations/Legend/*.js",
        },
        {
          name:"Axis",
          components: "src/components/decorations/Axis/*.js",
        },
        {
          name:"Plots",
          components: "src/components/decorations/Plots/*.js",
        }
      ]
    },

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
