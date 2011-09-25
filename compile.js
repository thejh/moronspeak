#! /usr/bin/env node

var lex = require('./lexer')
  , compile = require('./parser').compile
  , parse = require('./parser').parse
  , fs = require('fs')

var code = fs.readFileSync(process.argv[2]+'.moron', 'utf8')
code = compile(parse(lex(code)))
fs.writeFileSync(process.argv[2]+'.js', code+'\n')
