<?php

/**
 * Mini Content Resolution System for html templates and image files.
 *
 * For HTML :
 *
 * If the template path is '/foo/bar.html'
 *
 * Checks in order :
 *
 * brands/foo/bar.html
 * brands/default/foo/bar.html
 * brands/default/bar.html
 * partials/foo/bar.html
 *
 * For images :
 *
 * If the image path is '/foo/bar.jpg'
 *
 * Checks in order :
 *
 * brands/foo/images/bar.jpg
 * brands/default/images/foo/bar.jpg
 * brands/default/images/bar.jpg
 * images/foo/bar.jpg
 *
 */
$DEBUG = false;

// Brands directory on disk. Change to absolute if req'd.
$contentPath = '../brands/';
$templateName = $_GET['template'];
$imageName = $_GET['image'];

if($templateName == NULL && $imageName == NULL) {
  exit;
}
$isImage = $imageName != NULL;
$isTemplate = $templateName != NULL;

if($isImage) {
  $itemPath = $imageName;
} else {
  $itemPath = $templateName . '.html';
}

// Early out if .. is in the path
if(strpos($itemPath,'..') !== FALSE) {
  exit;
}

function debug($str) {
  if($GLOBALS['DEBUG']) {
    echo '<p>' . $str . '</p>';
  }
}

function itemNotFound($name, $isImage) {
  if($GLOBALS['DEBUG'] && !$isImage) {
    echo '<p>Not found ' . $name . '</p>';
  } else {
    header("HTTP/1.0 404 Not Found");
  }
}

// Check a list of possible template file locations
function readItem($files, $isImage) {
  foreach($files as $file) {
    debug('Read Item ' . $file);
    if(file_exists($file)) {
      if($isImage) {
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        header("Content-Type: image/" . $ext);
        header("Content-Length: " . filesize($file));
      }
      readfile($file);
      exit;
    }
  }
  return FALSE;
}

debug('Item : ' . $itemPath . '. Dir ' . dirname($itemPath));

$bits = [];

// Is it just a template file reference : template.html
if(strcmp(dirname($itemPath), '.') == 0) {
  $brand = 'default';
} else {
  // There are path components, e.g. directory/template.html
  // explode the path and keep the top level directory as a potential brand name
  $bits = explode('/',dirname($itemPath));
  debug('Path parts ' . count($bits));
  if(count($bits) > 0) {
    $brand = $bits[0];
  }
}

debug('Brand is ' . $brand);

$customBrand = strcmp($brand, 'default') != 0;

if($itemPath === NULL) {
  itemNotFound('None', $isImage);
  exit;
} else {
  $filesToTry = array();
  if($isImage) {
    $itemFile = $contentPath . $brand . '/images/' . substr($itemPath,strlen($brand)+1);
    $defaultFile = $contentPath . 'default/images/' . $itemPath;
  } else {
    $itemFile = $contentPath . $itemPath;
    $defaultFile = $contentPath . 'default/' . $itemPath;
  }

  $filesToTry[] = $itemFile;
  $filesToTry[] = $defaultFile;
  if($customBrand) {
    $bits[0] = 'default';
    $fallback = $contentPath . join('/',$bits) . '/' . basename($itemPath);
    $filesToTry[] = $fallback;
  }

  // Also check the app itself, so the app can supply its own defaults
  if($isImage) {
    $filesToTry[] = '../images/' . $itemPath;
  } else {
    $filesToTry[] = '../partials/' . $itemPath;
  }


  if(readItem($filesToTry, $isImage) == FALSE) {
    itemNotFound($itemPath, $isImage);
  }
}

itemNotFound($itemPath, $isImage);
?>
