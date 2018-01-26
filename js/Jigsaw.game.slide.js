Jigsaw.game.Slide = function(config) {
	this.stage = null;
	this.canvas = config.canvas;
	this.game_area = config.game_area;
	this.ctrl_area = config.control_area;

	this.image = config.image;
	this.score = 0;

	this.row = config.seg.row;
	this.col = config.seg.col;
	this.count = this.row * this.col;
	this.fps = config.fps;
	if (config.maxScore === undefined || config.maxScore === null) 
		this.score = 1000;
	else this.score = config.maxScore;

	this.seg = [];
	this.current_pos = [];
	this.map = [];
	this.hidden = null;
	this.h_pos = {x:this.col - 1, y: this.row - 1};
	this.game_status = {
		running: false
	};
}

Jigsaw.game.Slide.prototype.GameStart = function() {
	var i, j;
	var that = this;
	
	this.width = this.game_area.w / this.col;
	this.height = this.game_area.h / this.row;

	for (i = 0; i < this.row; i++)
		for (j = 0; j < this.col; j++)
		{
			this.seg[i * this.col + j] = new Jigsaw.object.Image({
				sx: ~~(j*this.image.width/this.col),
				sy: ~~(i*this.image.height/this.row),
				orgw: this.image.width/this.col,
				orgh: this.image.height/this.row,
				width: this.width,
				height: this.height,
				img: this.image,
			});
		}

	this.stage = new Jigsaw.Stage(this.canvas, {
		height: this.canvas.height,
		width: this.canvas.width,
		fps: this.fps
	});

	this.menu = new Jigsaw.game.menu(this, 0, 1000, true);

	for (i = 0; i < this.col; i++) this.map[i] = [];

	for (i = 0; i < this.count; i++)
	{
		this.stage.addObj(this.seg[i]);
		this.current_pos[this.seg[i].id] = {x: i % this.col, y : ~~(i / this.col)};
		this.map[this.current_pos[this.seg[i].id].x][this.current_pos[this.seg[i].id].y] = i;
	}
	this.hidden = this.seg[this.count-1];
	this.shuffle();


	for (i = 0; i < this.count-1; i++)
	{
		this.seg[i].addEventListener("mousedown", function(x){
			return function(){
				that.stage.toTop(that.seg[x]);
			};
		}(i));
		/*
		that.seg[i].addEventListener("mousein", function(x){
			return function(){
				console.log('x', x);
				console.log('map', that.map[that.current_pos[that.seg[x].id].x][that.current_pos[that.seg[x].id].y]);
				console.log('id', that.seg[x].id);
				console.log('cp', that.current_pos[that.seg[x].id]);
			};
		}(i));
*/
		this.seg[i].addEventListener("mouseup", function(x){
			return function(){
				var id = that.seg[x].id;
				var p_y = that.current_pos[id].y, p_x = that.current_pos[id].x;
				var i;
				if (p_y == that.h_pos.y) {
					if (p_x < that.h_pos.x) {
						for (i = that.h_pos.x; i > p_x; i--) {
							that.swapPos(that.seg[that.map[i][p_y]], that.seg[that.map[i - 1][p_y]]);
							that.unfocus(that.seg[that.map[i][p_y]]);
						}
					}
					else {
						for (i = that.h_pos.x; i < p_x; i++) {
							that.swapPos(that.seg[that.map[i][p_y]], that.seg[that.map[i + 1][p_y]]);
							that.unfocus(that.seg[that.map[i][p_y]]);
						}
					}
					that.h_pos.x = p_x;
					checkwin();
				}
				else if (p_x == that.h_pos.x) {
					if (p_y < that.h_pos.y) {
						for (i = that.h_pos.y; i > p_y; i--) {
							that.swapPos(that.seg[that.map[p_x][i]], that.seg[that.map[p_x][i - 1]]);
							that.unfocus(that.seg[that.map[p_x][i]]);
						}
					}
					else {
						for (i = that.h_pos.y; i < p_y; i++) {
							that.swapPos(that.seg[that.map[p_x][i]], that.seg[that.map[p_x][i + 1]]);
							that.unfocus(that.seg[that.map[p_x][i]]);
						}
					}
					that.h_pos.y = p_y;
					checkwin();
				}
			};
		}(i));
	}

	this.game_status.running = true;
	this.stage.Initialize();
	this.stage.Run();
}

Jigsaw.game.Slide.prototype.shuffle = function() {
	var i, j, t, x;
	var obj;
	var s = [];

	for (i = 0; i < this.count - 1; i++) s[i] = i;

	for (i = 0; i < this.count - 1; i++) {
		x = getRandom(i, this.count - 1);
		this.swapPos(this.seg[s[i]], this.seg[s[x]]);
		t = s[i]; s[i] = s[x]; s[x] = t;
	}
	x = 0;
	for (i = 0; i < this.count - 1; i++) {
		for (j = i + 1; j < this.count - 1; j++) {
			var id1 = this.map[i % this.col][~~(i / this.col)];
			var id2 = this.map[j % this.col][~~(j / this.col)];
			if (this.seg[id1].sy > this.seg[id2].sy ||
					this.seg[id1].sy == this.seg[id2].sy && this.seg[id1].sx > this.seg[id2].sx)
				++x;
		}
	}

	if (x % 2 != 0) {
		this.swapPos(this.seg[0], this.seg[1]);
	}

	for (i = 0; i < this.count - 1; i++) {
		obj = this.seg[i];
		obj.setPos(
			this.game_area.x + this.current_pos[obj.id].x * this.width + this.width / 2, 
			-this.height /2
		);
	}
	this.hidden.setPos(-this.width/2, -this.height/2);
	
}

Jigsaw.game.Slide.prototype.swapPos = function(a, b) {
	var t = this.map[this.current_pos[a.id].x][this.current_pos[a.id].y];
	this.map[this.current_pos[a.id].x][this.current_pos[a.id].y] = this.map[this.current_pos[b.id].x][this.current_pos[b.id].y];
	this.map[this.current_pos[b.id].x][this.current_pos[b.id].y] = t;

	t = this.current_pos[a.id].x; this.current_pos[a.id].x = this.current_pos[b.id].x; this.current_pos[b.id].x = t;
	t = this.current_pos[a.id].y; this.current_pos[a.id].y = this.current_pos[b.id].y; this.current_pos[b.id].y = t;
}

Jigsaw.game.Slide.prototype.focus = function(obj) {
	obj.bind_shape(this.width * 1.1, this.height * 1.1, 100);
}

Jigsaw.game.Slide.prototype.unfocus = function(obj) {
	obj.bind_motion(
		this.game_area.x + this.current_pos[obj.id].x * this.width + this.width/2,
		this.game_area.y + this.current_pos[obj.id].y * this.height + this.height/2,
		100);
}

Jigsaw.game.Slide.prototype.scatter = function(){
	var step = 50 / (this.count - 1);
	for (var i in this.seg) {
		if (this.seg[i] == this.hidden) continue;
		this.seg[i].bind_shape(this.width, this.height, (i+1)*step);
		this.seg[i].bind_motion( 
				this.game_area.x + this.current_pos[this.seg[i].id].x * this.width + this.width/2,
				this.game_area.y + this.current_pos[this.seg[i].id].y * this.height + this.height/2,
				(i+1) * step);
	}
	
}

Jigsaw.game.Slide.prototype.__checkwin = function(){
	for (var i = 0; i < this.count; i++) {
		if (i != this.current_pos[this.seg[i].id].x + this.current_pos[this.seg[i].id].y * this.col) {
			return false;
		}
	}
	return true;
}

