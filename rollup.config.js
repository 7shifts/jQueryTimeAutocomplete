import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";

export default [
  {
    input: "src/index.js",
    output: {
      file: "jquery.timeAutocomplete.min.js",
      format: "iife"
    },
    plugins: [
      terser(),
      babel({
        exclude: "node_modules/**" // only transpile our source code
      })
    ]
  },
  {
    input: "src/core/AMPMParser.js",
    output: {
      file: "ampm_parser.js",
      name: "ampm_parser",
      format: "umd"
    },
    plugins: [
      terser(),
      babel({
        exclude: "node_modules/**" // only transpile our source code
      })
    ]
  },
  {
    input: "src/core/AMPMParser.js",
    output: {
      file: "es/ampm_parser.js",
      name: "ampm_parser",
      format: "esm"
    },
    plugins: [
      terser(),
      babel({
        exclude: "node_modules/**" // only transpile our source code
      })
    ]
  }
];
