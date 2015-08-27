<html>
<head>
  <?php
  echo "<meta http-equiv=\"refresh\" content=\"0;url=/Shibboleth.sso/Login?target=https://".$_SERVER{HTTP_HOST}.$_SERVER{REQUEST_URI}."\">";
  ?>
</head>
<body>
<!-- <h1>You are being redirected to login via Shibboleth</h1>
<p>Please click
<?php
echo " <a href=\"/Shibboleth.sso/Login?target=https://".$_SERVER{HTTP_HOST}.$_SERVER{REQUEST_URI}."\">here</a> "
?>
to continue.</p> -->
</body>
</html>
