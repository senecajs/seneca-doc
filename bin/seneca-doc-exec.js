#!/usr/bin/env node

/* Copyright (c) 2019 voxgig and other contributors, MIT License */
'use strict'

const Path = require('path')

const Inspect = require('../lib/inspect.js')

const LocalFolder = process.cwd()
const LocalPackage = require(Path.resolve(LocalFolder, 'package.json'))

inspect_local_plugin()

async function inspect_local_plugin() {
  var out = await Inspect(LocalFolder, LocalPackage)
  console.log(out)
}
