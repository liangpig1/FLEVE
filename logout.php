<?php
	header('Content-Type: text/html; charset=utf-8');
	session_start();
	require('config.php');
	var_dump($_SESSION);
	unset($_SESSION['user_name']);
	unset($_SESSION['uid']);
	header("Location: ".$index_url);
?>

