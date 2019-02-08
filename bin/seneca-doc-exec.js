#!/usr/bin/env node

const Inspect = require('../lib/inspect.js')

const LocalPackage = require('./package.json')
const LocalFolder = process.cmd()

console.log(LocalFolder, LocalPackage)

const spec = inspect(LocalFolder, LocalPackage)
console.log(spec)


