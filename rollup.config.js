import { uglify } from "rollup-plugin-uglify";
import babel from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: {
    file: "jquery.timeAutocomplete.min.js",
    format: "iife"
  },
  plugins: [
    uglify(),
    babel({
      exclude: "node_modules/**" // only transpile our source code
    })
  ]
};
