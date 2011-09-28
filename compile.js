#! /usr/bin/env node

var lex = require('./lexer')
  , compile = require('./parser').compile
  , parse = require('./parser').parse
  , fs = require('fs')

var defaultRules = parse(lex(fs.readFileSync(__dirname+'/standard.moron', 'utf8'))).rules
var code = fs.readFileSync(process.argv[2]+'.moron', 'utf8')
code = compile(parse(lex(code), defaultRules).nodes)
fs.writeFileSync(process.argv[2]+'.js', code+'\n')
