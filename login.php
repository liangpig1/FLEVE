<?php
	header('Content-Type: text/html; charset=utf-8');
	require('config.php');
	$link = mysql_connect($DbHost, $DbUserName, $DbPassword);
	if (!$link) die ('Could not connect: ' . mysql_error());
	mysql_select_Db("jigsaw");
	if (isset($_POST["user_name"]) && $_POST["user_name"] != null &&
		isset($_POST["user_password"]) && $_POST["user_password"] != null) {
			$user_name = $_POST["user_name"];
			$user_password = $_POST["user_password"];
			$result = mysql_query("SELECT * FROM `jigsaw_user` WHERE `name` = '$user_name' AND `password` = '$user_password'");
			$numrows = mysql_numrows($result);
			if ($numrows == 1) {
				$row = mysql_fetch_assoc($result);
				session_register('uid');
				session_register('user_name');
				$_SESSION['uid']=$row['id'];
				$_SESSION['user_name']=$row['name'];
				return true;
			}
			else {
				printf("用户名或密码错误");
			}
	}
?>
