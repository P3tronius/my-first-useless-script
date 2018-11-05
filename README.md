# Installation

* Install Tampermonkey
* Add the script in build/bundle.js

# Development

* Install NodeJS
* Clone repo
* Install rollup as global:
```bash
cd [repo]
npm -g i rollup
```
* Install dependencies:
```bash
npm i
```
* Build the lib:
````bash
npm run build
#or
rollup -c --no-treeshake
````
* Update the compiled bundle in tampermonkey