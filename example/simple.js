var $str_splitted_at_$delimiter = function($str, $delimiter) { return $str.split($delimiter) };
;
var print_$str = function($str) { console.log($str) };
;
print_$str($str_splitted_at_$delimiter("foo|bar|baz", "|"))
