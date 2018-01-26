<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
		<title>Jigsaw PUZ!!!</title>
		<style>
			a {
				color: white;
			}
			#userinfo{
				text-align: right;
				background-color: blue;
				color: white
			}
			footer{
				text-align: right;
				background-color: blue;
				color: white
			}
		</style>
		
		<script src="./js/jigsaw.def.js"></script>
		<script src="./js/jigsaw.utility.js"></script>
		<script src="./js/jigsaw.base.js"></script>
		<script src="./js/jigsaw.object.beta.js"></script>
		<script src="./js/jigsaw.menu.js"></script>
		<script src="./js/jigsaw.game.switch.js"></script>
		<script src="./js/jigsaw.game.slide.js"></script>
		<script src="./js/jigsaw.game.drag.js"></script>
		<script src="./js/jigsaw.game.menu.js"></script>
		<script>
			window.onload = function(){
				before_init();
			}
		</script>
	</head>
	<body>
	<header id="userinfo">
<?php 
	session_start();
	require('config.php');
	if (isset($_SESSION['user_name']) && $_SESSION['user_name'] != null) {
		echo ($_SESSION['user_name']."的账户 &nbsp;&nbsp;<a id='logout' href='./logout.php'>登出</a>");
	}
	else {
		unset($_SESSION['user_name']);
		unset($_SESSION['uid']);
		echo "<a id='login' href=''>登录</a>&nbsp;&nbsp;&nbsp;<a id='register' href=''>注册</a>";
	}
?>
	</header>
	<script type="text/javascript">
		var btn_login = document.getElementById("login");
		var btn_register;
		if (btn_login !== null) {
			btn_login.onclick = function(){
				var sFeatures = "cneter:yes,diaglogHeight:400, dialogWidth:400, edge: sunken,status:no";
				var answer = window.showModalDialog('login.html', "", sFeatures);
			}
			btn_register = document.getElementById("register");
			btn_register.onclick = function(){
				var sFeatures = "cneter:yes,diaglogHeight:400, dialogWidth:400, edge: sunken,status:no";
				var answer = window.showModalDialog('register.html', "", sFeatures);
			}
		}
	</script>
		<canvas id="content" width="800" height="600"></canvas> 
		<footer>COPYRIGHT by Liangpig1</footer>
	</body>
</html>

