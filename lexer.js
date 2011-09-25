module.exports = lex;

// take the code and make tokens
// rules:
//  - spaces split tokens
//  - names stay complete
//  - symbol stuff gets chopped in single chars
//  - convert indentation (with spaces) to indent tokens
function lex(code) {
  // create a 'lines' array
  var lines = (function() {
    var row = 0
    return code.split('\n').map(function(code) {
      return {code: code, row: ++row}
    }).filter(function(line) {
      line = line.code.trim()
      if (line.length === 0) return false;
      if (line.slice(0, 2) === '//') return false;
      return true;
    }).map(function(line) {
      var prePad = /^ */.exec(line.code)[0].length
      return {indent: prePad, code: line.code.slice(prePad)}
    })
  })()
  
  // add indentation levels
  ;(function() {
    var indentStack = [0]
    lines.forEach(function(line) {
      var indent = line.indent
      if (indent > last(indentStack))
        indentStack.push(indent)
      while (indent > last(indentStack)) indentStack.pop()
      if (indent !== last(indentStack))
        throw new Error('invalid outdent on line '+line.row)
      line.level = indentStack.length
    })
  })()
  
  return (function() {
    var tokens = []
    var level = 1
    lines.forEach(function(line) {
      while (line.level > level) level++, tokens.push({type: 'indent'})
      while (line.level < level) level--, tokens.push({type: 'outdent'})
      tokens = tokens.concat(lexLine(line.code))
    })
    while (level > 1) level--, tokens.push({type: 'outdent'})
    return tokens
  })()
}

function lexLine(code) {
  // types: string,name,number,symbol
  function charType(char, nextChar, lastType) {
    var symbols = ['!', '.', '<', '>', '=', ',', '+', '-', '*', '/'];
    var strSymbols = ["'", '"', '`']
    var nameChar = /[a-zA-Z_äöüÄÖÜß]/
    if (char === ' ')
      return 'none'
    if (~strSymbols.indexOf(char))
      return 'string'
    if (nameChar.test(char))
      return 'name'
    if (/[0-9]/.test(char))
      return 'number'
    if (lastType !== 'number' && /[-.]/.test(char) && /[0-9.]/.test(nextChar))
      return 'number'
    if (lastType === 'number' && char === 'e')
      return 'number'
    if (lastType === 'number' && char === '.' && /[0-9]/.test(nextChar))
      return 'number'
    if (~symbols.indexOf(char))
      return 'symbol'
    throw new Error("wtf is '"+char+"'?")
  }
  var compilers =
  { string: function() {
      return JSON.stringify(this.value)
    }
  }
  
  var tokens = []
  var currentType = 'none'
  var lastType = 'none'
  var part = ''
  for (var i=0; i<code.length; i++) {
    if (code.slice(i, i+2) === '//') return tokens
    lastType = currentType
    currentType = charType(code[i], code[i+1], lastType)
    if (currentType === lastType && currentType !== 'symbol' && currentType !== 'string') {
      part += code[i]
    } else {
      if (lastType !== 'none')
        tokens.push({type: lastType, value: part, compile: compilers[lastType]})
      if (currentType === 'string') {
        part = (function() {
          var quoteType = code[i]
          var start = i
          i++
          while (code[i] !== quoteType) {
            if (code[i] === '\\') i++
            i++
          }
          return eval(code.slice(start, i+1))
        })()
      } else {
        part = code[i]
      }
    }
  }
  if (part.length > 0)
    tokens.push({type: currentType, value: part, compile: compilers[currentType]})
  return tokens
}

function last(arr) { return arr[arr.length - 1] }

// console.log(lex(require('fs').readFileSync('example/example.moron', 'utf8')))
