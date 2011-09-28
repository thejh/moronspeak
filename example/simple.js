var $str_splitted_at_$delimiter = function($str, $delimiter) { return $str.split($delimiter) };
;
var $str_uppercased = function($str) { return $str.toUpperCase() };
;
/* native literal definition */
;
console.log($str_splitted_at_$delimiter("foo|bar|baz", "|"));
if ("abc" === "def") {console.log("oh noes!");
console.log("that can't be!")};
if ("abc" !== "def") {console.log("yay, the universe still works!")};
console.log($str_splitted_at_$delimiter("foo|bar|baz", "|").map(function(it){$str_uppercased(it)}))
