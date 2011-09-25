var $str_splitted_at_$delimiter = function($str, $delimiter) { return $str.split($delimiter) };
;
$str_splitted_at_$delimiter($str_splitted_at_$delimiter("foo|bar|baz+abc|def|ghi", "+"), "|");
.