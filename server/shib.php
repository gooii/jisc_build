<?php
$userData = array();

echo "var userData = {";

echo 'ip:"' . $_SERVER['REMOTE_ADDR'] . '"';

if(array_key_exists("persistent-id", $_SERVER)) {
  $persistentIdParts = explode('!', $_SERVER['persistent-id']);
  echo ',idp:"' . $persistentIdParts[0] . '"';
  if(count($persistentIdParts) >= 3) {
    echo ',persistentId:"' . $persistentIdParts[2] . '"';
  }
  if(array_key_exists("affiliation", $_SERVER)) {
    echo ',affiliation:"' . $_SERVER['affiliation'] . '"';
  }
  if(array_key_exists("eppn", $_SERVER)) {
    echo ',user:"' . $_SERVER['eppn'] . '"';
  }
}

echo "};\n";

if(file_exists('brands/routes.js')) {
  readfile('brands/routes.js');
}

if(file_exists('brands/brands.json')) {
  echo 'var brands = ';
  readfile('brands/brands.json');
  echo ';';
}
?>
