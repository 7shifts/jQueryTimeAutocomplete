import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  output: {
    file: 'jquery.timeAutocomplete.min.js',
    format: 'iife',
  },
  plugins: [
    uglify()
  ]
};
