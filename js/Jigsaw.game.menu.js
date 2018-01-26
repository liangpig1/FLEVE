Jigsaw.game.menu = function(game, time, score, __scoreDecPerMove) {
	var that = this;
	this.status= {
		running : false,
		win: false
	}
	this.game = game;
	this.topScore = score;
	this.score = score;
	this.speed = 1;
	this.totTime = time;
	this.curTime = time;
	this.isScoreDecPerMove = __scoreDecPerMove;
	if (__scoreDecPerMove) this.scoreDecPerMove = 5; else this.scoreDecPerMove = 0;
	var margin = 40;
	var screenWidth = game.ctrl_area.x + game.ctrl_area.w;
	var screenHeight = game.ctrl_area.h;

	this.obj_game_bkg = new Jigsaw.object.Image({
		img: img_bkg,
		sx: 0, sy: 0,
		orgw: img_bkg.width, orgh: img_bkg.height,
		width: screenWidth,
		height: screenHeight
	});

	this.obj_sidebar_game = new Jigsaw.object.Image({
		img: img_sidebar, 
		sx: 0, sy: 0,
		orgw: img_sidebar.width, orgh:img_sidebar.height,
		width: img_sidebar.width, height: img_sidebar.height
	});

	this.obj_frame_time = new Jigsaw.object.Rectangle({
		width: game.ctrl_area.w * 0.8,
		height: screenHeight * 0.05,
		fill_color: null,
		stroke_color: "rgba( 255, 0, 0, 0.8)"
	});

	this.obj_bar_time = new Jigsaw.object.Rectangle({
		width: game.ctrl_area.w * 0.8,
		height: screenHeight * 0.05,
		fill_color: "rgba(0, 255, 0, 0.5)",
		stroke_color: null
	});

	this.obj_score = new Jigsaw.object.StaticText({
		str: "SCORE:" + this.score, 
		font: "400 50px/2 cursive, sans-serif",
		fill_color: "rgba(0, 255, 0, 0.5)",
		stroke_color: null,
		width: 260,
		height: 40
	});

	this.obj_btn_btm = new Jigsaw.object.Image({
		img: img_btn,
		sx: 0, sy: img_btn.height/2, 
		orgw: img_btn.width/2, orgh: img_btn.height/4,
		width: img_btn.width/2, height: img_btn.height/4
	});

	this.obj_panel_mat = new Jigsaw.object.Image({
		img: img_panel,
		sx: 0, sy:0,
		orgw: img_panel.width, orgh: img_panel.height,
		width: game.game_area.w + margin, height: game.game_area.h + margin
	});

	var stage = game.stage;

	//background
	stage.addObj(this.obj_game_bkg, screenWidth/2, screenHeight/2);

	// panel under jigsaw
	stage.addObj(this.obj_panel_mat, game.game_area.x + game.game_area.w / 2, -this.obj_panel_mat.height/2);

	//sidebar in the game
	stage.addObj(this.obj_sidebar_game, screenWidth + this.obj_sidebar_game.width/2, screenHeight / 2);
	this.obj_sidebar_game.bind_motion(game.ctrl_area.x + this.obj_sidebar_game.width/2,
			screenHeight / 2, 300,
			function(){
				if (game.scatter !== null && game.scatter !== undefined)
					that.obj_panel_mat.bind_motion(game.game_area.x + game.game_area.w / 2, 
					game.game_area.y + game.game_area.h / 2, 
					300, function(){game.scatter();});
				else that.obj_panel_mat.bind_motion(game.game_area.x + game.game_area.w / 2, 
					game.game_area.y + game.game_area.h / 2, 
					300);
			});
	stage.addObj(this.obj_btn_btm, screenWidth + this.obj_sidebar_game.width/2, screenHeight * 0.67);
	this.obj_btn_btm.bind_motion(game.ctrl_area.x + this.obj_btn_btm.width/2 + 30,
		   screenHeight * 0.67, 300);	
	this.obj_btn_btm.addEventListener("mouseup", function(){
		if (game.video) game.image.pause();
		game.stage.exit();
		game.stage = null;
		game.menu = null;
		game = null;
		menu = new Jigsaw.Stage(canvas, cfg);
		for (var i in list_objects) {
			menu.addObj(list_objects[i]);
		}
		resume();
		menu.Initialize();
		menu.Run();
	});
	this.obj_btn_btm.addEventListener("mousein", function(){
		that.obj_btn_btm.bind_motion(game.ctrl_area.x + that.obj_btn_btm.width/2, screenHeight * 0.67, 150);
		that.obj_btn_btm.mount_sfx(
			function(){
				var obj = that.obj_btn_btm;
				stage.isContentChanged = true;
				var pos = stage.mousePos;
				var radgrad = stage.ctx.createLinearGradient(
					obj.width/2, 
					obj.height/2,
					-obj.width/2, 
					-obj.height/2
				);
				radgrad.addColorStop(0, 'rgba(255,255,255,1)');
				radgrad.addColorStop(1, 'rgba(255,255,255,0)');

				stage.ctx.fillStyle = radgrad;
				stage.ctx.fillRect(
					-obj.width/2, -obj.height/2,
					obj.width, obj.height
					);
			},
			function(){
				if (!that.obj_btn_btm.status.mouseover) return true;
			});
	});
	this.obj_btn_btm.addEventListener("mouseout", function(){
		that.obj_btn_btm.bind_motion(game.ctrl_area.x + that.obj_btn_btm.width/2 + 30, screenHeight * 0.67, 100);
	});
	//time display
	stage.addObj(this.obj_frame_time, 
			screenWidth + this.obj_sidebar_game.width / 2, game.ctrl_area.h * 0.1);
	this.obj_frame_time.bind_motion(game.ctrl_area.x + game.ctrl_area.w * 0.5, 
			game.ctrl_area.h * 0.1, 300);
	stage.addObj(this.obj_bar_time,
			screenWidth + this.obj_sidebar_game.width / 2, game.ctrl_area.h * 0.1);
	this.obj_bar_time.bind_motion(game.ctrl_area.x + game.ctrl_area.w * 0.5, 
			game.ctrl_area.h * 0.1, 300);
	stage.addObj(this.obj_score, screenWidth + this.obj_score.width/2, game.ctrl_area.h * 0.2);
	if (this.totTime == 0) this.obj_bar_time.fill_color = "gray";
	this.obj_score.bind_motion(game.ctrl_area.x + this.obj_score.width / 2 + 19, game.ctrl_area.h * 0.2, 300, 
			function(){ that.countdown();});
}

Jigsaw.game.menu.prototype.countdown = function(){
	var that = this;
	var step = this.speed / this.totTime * this.obj_bar_time.width;

	this.status.running = true;
	this.game.stage.mainFunc = function(){
		if (that.status.running)
		{
			if (that.totTime != 0) {
				if (that.curTime >= 0) {
					that.curTime -= that.speed;
					that.obj_bar_time.x -= step / 2;
					that.obj_bar_time.width -= step;

					var g = ~~(that.curTime / that.totTime * 255);
					var r = 255 - g;
					var color = "rgba("+r+","+g+",0, 0.8)";

					that.obj_bar_time.fill_color = color;
					that.obj_score.fill_color = color;
					that.game.stage.isContentChanged = true;
				}
				else {
					that.obj_score.fill_color = "gray";
					that.score -= that.speed * 5;
					that.checklose();
				}
				that.obj_score.setText("SCORE:" + that.score);
			}
		}
	}
}

Jigsaw.game.menu.prototype.updateStatus = function(){
	this.score -= this.scoreDecPerMove;
	this.checkwin();
}

Jigsaw.game.menu.prototype.checkwin = function(){
	if (this.game.__checkwin()) {
		this.status.running = false;
		this.status.win = true;
		if (this.game.winScene == null) this.defaultWinScene();
		return true;
	}
	return false;
}

Jigsaw.game.menu.prototype.checklose = function(){
	if (this.score < ~~(this.topScore / 4)) {
		this.status.running = false;
		this.status.win = false;
		this.defaultLoseScene();
		return true;
	}
	return false;
}


Jigsaw.game.menu.prototype.defaultLoseScene = function(){
	var game = this.game;
	var stage = game.stage;
	var x = stage.mousePos.x,
		y = stage.mousePos.y;

	var wave = new Jigsaw.object.Circle({
			radius: 20,
			fill_color: "rgba(0,0,0,0)"
	});
	stage.addObj(wave, x, y);
	wave.events.receive = false;

	var destr = Math.sqrt(game.game_area.w * game.game_area.w + game.game_area.h * game.game_area.h);
	wave.bind_shape(destr, 1000);
	wave.mount_func(function(){
			var radgrad = stage.ctx.createRadialGradient(
				0, 0, 0.0,
				0, 0, wave.radius);
			radgrad.addColorStop(0, 'rgba(0,0,0,0)');
			radgrad.addColorStop(1, 'rgba(0,0,0,1)');
			wave.fill_color = radgrad;
		},null);

	for (var i = 0; i < game.count; i++) {
		game.seg[i].events.receive = false;
		game.seg[i].mount_func(function(obj){
			return function(){ obj.opacity -= 0.1;};
		}(game.seg[i]), function(obj){
			return function(){ if (obj.opacity <= 0.5) {obj.opacity = 0.5;return true;}};
		}(game.seg[i]));
	}
}

Jigsaw.game.menu.prototype.defaultWinScene = function(){
	var game = this.game;
	var stage = game.stage;
	var x = stage.mousePos.x,
		y = stage.mousePos.y;

	var wave = new Jigsaw.object.Circle({
			radius: 20,
			life: 200,
			fill_color: "rgba(255,255,255,0)"
	});
	stage.addObj(wave, x, y);
	wave.events.receive = false;

	var destr = Math.sqrt(game.game_area.w * game.game_area.w + game.game_area.h * game.game_area.h);
	wave.bind_shape(destr, 1000, function(){wave.bind_shape(10, 120);});
	wave.mount_func(function(){
			var radgrad = stage.ctx.createRadialGradient(
				0, 0, 0.0,
				0, 0, wave.radius);
			radgrad.addColorStop(0, 'rgba(255,255,255,0)');
			radgrad.addColorStop(1, 'rgba(255,255,255,0.2)');
			wave.fill_color = radgrad;
		},null);

	for (var i = 0; i < game.count; i++) {
		game.seg[i].events.receive = false;
		game.fx[i].end = function(obj){
			return function(){
				if (distance({x: wave.x, y: wave.y}, {x: obj.x, y: obj.y}) < wave.radius)return true;
			}
		}(game.seg[i]);
		game.seg[i].mount_func(function(obj){
			return function(){ obj.opacity -= 0.1;};
		}(game.seg[i]), function(obj){
			return function(){ if (obj.opacity <= 0.5) {obj.opacity = 0.5;return true;}};
		}(game.seg[i]));
	}
}
	
