import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";
import globals from 'rollup-plugin-node-globals';

import { uglify } from "rollup-plugin-uglify";
import packageJSON from "./package.json";

const input = "./src/index.js";
const minifyExtension = pathToFile => pathToFile.replace(/\.js$/, ".min.js");

export default [
    // CommonJS
    {
        input,
        output: {
            file: packageJSON.main,
            format: "cjs",
            sourcemap: true
        },
        plugins: [
            babel({
                exclude: "node_modules/**",
                runtimeHelpers: true
            }),
            external(),
            resolve(),
            commonjs({include: ['src/*','node_modules/**']})
        ]
    },
    {
        input,
        output: {
            file: minifyExtension(packageJSON.main),
            format: "cjs",
            sourcemap: true
        },
        plugins: [
            babel({
                exclude: "node_modules/**",
                runtimeHelpers: true
            }),
            external(),
            resolve(),
            commonjs({include: ['src/*','node_modules/**']}),
            terser()
        ]
    },
    // UMD
    {
        input,
        output: {
            file: packageJSON.browser,
            format: "umd",
            sourcemap: true,
            name: "figtreejs",
            globals: {
                react: "React",
                "@emotion/styled": "styled",
                "@emotion/core": "core"
            }
        },
        plugins: [
            babel({
                exclude: "node_modules/**",
                runtimeHelpers: true
            }),
            external(),
            resolve(),
            globals(),
            commonjs({include: ['src/*','node_modules/**']})
        ]
    },
    {
        input,
        output: {
            file: minifyExtension(packageJSON.browser),
            format: "umd",
            sourcemap: true,
            name: "figtreejs",
            globals: {
                react: "React",
                "@emotion/styled": "styled",
                "@emotion/core": "core"
            }
        },
        plugins: [
            babel({
                exclude: "node_modules/**",
                runtimeHelpers: true
            }),
            external(),
            resolve(),
            commonjs({include: ['src/*','node_modules/**']}),
            terser(),
            globals(),
        ]
    },
    // ES
    {
        input,
        output: {
            file: packageJSON.module,
            format: "es",
            sourcemap: true,
            exports: "named"
        },
        plugins: [
            babel({
                exclude: "node_modules/**",
                runtimeHelpers: true
            }),
            external(),
            resolve(),
            commonjs({include: ['src/*','node_modules/**']})
        ]
    },
    {
        input,
        output: {
            file: minifyExtension(packageJSON.module),
            format: "es",
            sourcemap: true,
            exports: "named"
        },
        plugins: [
            babel({
                exclude: "node_modules/**",
                runtimeHelpers: true
            }),
            external(),
            resolve(),
            commonjs({include: ['src/*','node_modules/**']}),
            terser()
        ]
    }
];