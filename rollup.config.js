import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import replace from "rollup-plugin-replace";

const NODE_ENV = process.env.NODE_ENV || "development";
const outputFile = NODE_ENV === "production" ? "./lib/prod.js" : "./lib/dev.js";
const input = "./src/index.js";

export default [
    // CommonJS
    {
        input,
        output: {
            file: outputFile,
            format: "cjs"
        },
        plugins: [
            replace({
                "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
            }),
            babel({
                exclude: "node_modules/**",
                runtimeHelpers: true

            }),
            resolve([ {preferBuiltins: true}]),
            commonjs()
        ],
        external: id => /^react/.test(id)

    },

];