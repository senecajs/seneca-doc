#!/usr/bin/env node

/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Path = require('path')

const Inspect = require('../lib/inspect.js')

const LocalFolder = process.cwd()
const LocalPackage = require(Path.resolve(LocalFolder, 'package.json'))

console.log(LocalFolder, LocalPackage)

const spec = Inspect(LocalFolder, LocalPackage)
console.log(spec)
