import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import esmin from 'rollup-plugin-esmin'

import pack from './package.json'

const name = pack.name
const modify = new Date().toJSON().split('.')[0].replace('T', ' ')
const banner = `/**
 * @name ${pack.name}
 * @version ${pack.version}
 * @desc ${pack.description}
 * @author ${pack.author}
 * @create date 2020-08-13 22:05:51
 * @modify date ${modify}
 */`

const bbl = babel({ babelHelpers: 'bundled' })

export default [
  {
    // Browser module
    input: 'src/browser.js',
    output: {
      name,
      banner,
      format: 'esm',
      file: 'dist/browser.js',
    },
    plugins: [bbl],
  },
  {
    // Browser UMD
    input: 'src/browser.js',
    output: {
      banner,
      format: 'umd',
      name: 'jsWebWorker',
      file: 'dist/browser.umd.js',
    },
    plugins: [bbl, esmin()],
  },

  {
    // Node module
    input: 'src/node.js',
    output: {
      name,
      banner,
      format: 'esm',
      exports: 'default',
      file: 'dist/node.mjs',
    },
    external: ['child_process', 'os', 'path', 'tiny-worker'],
    plugins: [bbl, commonjs()],
  },
  {
    // Node CommonJS
    input: 'src/node.js',
    output: {
      name,
      banner,
      format: 'cjs',
      exports: 'default',
      file: 'dist/node.js',
    },
    external: ['child_process', 'os', 'path', 'tiny-worker'],
    plugins: [bbl, commonjs()],
  },
]
