<?php
	require('config.php');
	$link = mysql_connect($DbHost, $DbUsername, $DbPassword);

	if (!$link) die ('Could not connect: ' . mysql_error());
	mysql_select_Db("jigsaw");

	$user_name = $_POST["user_name"];
	$password= $_POST["user_password"];

	$str = "SELECT * FROM `jigsaw_user` WHERE `name` = '$user_name'";
	$result = mysql_query($str);
	if ($row = mysql_fetch_array($result, MYSQL_NUM)) {
		echo "The username you specified already exists.<br/>";
	}
	else {
		$rt = mysql_query("INSERT INTO `jigsaw_user` 
			(`name` ,`password`)
			VALUES 
			('$user_name', '$password')");
		$_SESSION['uid'] = mysql_insert_id(); 
		$_SESSION['user_name'] = $user_name;
		header("Location: ./tools.php");
	}
?>
