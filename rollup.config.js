const path = require('path');
const license = require('rollup-plugin-license');
import html from 'rollup-plugin-html';

module.exports = {
  input: 'src/app/main.js',
    output: {
    file: 'build/bundle.js',
    format: 'esm',
    name: 'CashMachine',
    sourcemap: false
  },

  plugins: [
    license({
      banner: {
        file: path.join(__dirname, 'header.txt'),
      }
    }),
    html({
        include: '**/*.html'
     })
  ],
}