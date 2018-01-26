Jigsaw.game.Switch = function(config) {
	this.stage = null;
	this.game_area = config.game_area;
	this.ctrl_area = config.control_area;
	this.canvas = config.canvas;

	this.image = config.image;
	this.video = config.video;

	this.row = config.seg.row;
	this.col = config.seg.col;
	this.count = this.row * this.col;
	this.grid = [];
	this.fps = config.fps;

	this.drag = {
		start: {x: null, y: null},
		end: {x: null, y:null}
	};

	this.fx = [];

	var that = this;
	this.seg = [];

	//this.origin_pos = [];
	this.current_pos = [];

	this.currSeg = null;
	this.activeSeg = null;
	this.interactSeg = null;
}

Jigsaw.game.Switch.prototype.GameStart = function() {
	var i, j;
	var that = this;
	
	this.width = this.game_area.w / this.col;
	this.height = this.game_area.h / this.row;

	for (i = 0; i < this.row; i++)
		for (j = 0; j < this.col; j++)
		{
			this.seg[i*this.col + j] = new Jigsaw.object.Image({
				sx: j*this.image.width/this.col,
				sy: i*this.image.height/this.row,
				orgw: this.image.width/this.col,
				orgh: this.image.height/this.row,
				width: this.width,
				height: this.height,
				x: this.game_area.x + j * this.width + this.width/2,
				y: this.game_area.y + i * this.height + this.height/2,
				img: this.image}
			);
			this.grid[i*this.col+j] = {
				x: j, y: i
			};
		}

	this.stage = new Jigsaw.Stage(this.canvas, {
		height: this.canvas.height,
		width: this.canvas.width,
		fps: this.fps
	});

	var time = this.count * this.count * this.count / 3 - this.count * this.count;
	this.menu = new Jigsaw.game.menu(this, time, 1000, true);

	for (i = 0; i < this.count; i++)
	{
		this.stage.addObj(this.seg[i]);
		this.current_pos[this.seg[i].id] = i;
		this.fx[i] = this.seg[i].mount_sfx(function(obj){ return function(){that.drawBorder(obj);}; }(this.seg[i]));
	}


	this.shuffle();
	for (i = 0; i < this.count; i++)
	{
		this.seg[i].addEventListener("mousedown", function(x){
			return function(){
				that.stage.toTop(that.seg[x]);
				that.drag.start = that.stage.mousePos;
				that.currSeg = that.seg[x];
				that.focus(that.seg[x]);
			};
		}(i));
		this.seg[i].addEventListener("mouseup", function(x){
			return function(){
				if (that.interactSeg != null) {
					that.swapPos(that.seg[x], that.interactSeg);
					that.unfocus(that.interactSeg);
					that.interactSeg = null;
					that.menu.updateStatus();
				}
				that.unfocus(that.seg[x]);
				that.currSeg = null;
			};
		}(i));
		
		this.seg[i].addEventListener("drag", function(x){
			return function(){
				that.drag.end = that.stage.mousePos;
				var distx = that.drag.end.x - that.drag.start.x,
					disty = that.drag.end.y - that.drag.start.y;
				var obj = that.seg[x];
				var id, obj;

				that.instantMove(obj, distx, disty);
				that.detect(obj);
			};
		}(i));
		if (this.video) {
			this.seg[i].mount_sfx(
					function(){if (!(that.image.ended || that.image.paused)) that.stage.isContentChanged = true;}, 
					function(){ if (that.image.ended) return true;}
				);
		}
	}
	
	this.stage.Initialize();
	this.stage.Run();
}

Jigsaw.game.Switch.prototype.shuffle = function() {
	var i, t;
	var obj;
	var s = [];
	for (i = 0; i < this.count; i++) s[i] = i;

	for (i = 0; i < this.count; i++) {
		x = getRandom(i, this.count);
		this.swapPos(this.seg[s[i]], this.seg[s[x]]);
		t = s[i]; s[i] = s[x]; s[x] = t;
	}
	
	for (i = 0; i < this.count; i++) {
		obj = this.seg[i];
		obj.setPos(
			this.game_area.x + this.grid[i].x * this.width + this.width / 2, 
			-this.height/2
		);
		obj.setSize(this.width*0.5, this.height*0.5);
	}
}
Jigsaw.game.Switch.prototype.swapPos = function(a, b) {
	var t = this.current_pos[a.id];
	this.current_pos[a.id] = this.current_pos[b.id];
	this.current_pos[b.id] = t;
}

Jigsaw.game.Switch.prototype.focus = function(obj) {
	obj.bind_shape(this.width * 1.1, this.height * 1.1, 100);
}

Jigsaw.game.Switch.prototype.unfocus = function(obj) {
	obj.bind_shape(this.width, this.height, 100);
	obj.bind_motion(
		this.game_area.x+this.grid[this.current_pos[obj.id]].x * this.width + this.width/2,
		this.game_area.y+this.grid[this.current_pos[obj.id]].y * this.height + this.height/2,
		100);
}

Jigsaw.game.Switch.prototype.instantMove = function(obj, offsetx, offsety)
{
	obj.setPos(this.game_area.x+this.grid[this.current_pos[obj.id]].x * this.width + this.width/2 + offsetx, 
			this.game_area.y+this.grid[this.current_pos[obj.id]].y * this.height + this.height/2 + offsety);
}

Jigsaw.game.Switch.prototype.detect = function(obj) {
	var flag = false;
	for (var i in this.seg)
		if (obj !== this.seg[i]) {
			var distx = this.seg[i].x - obj.x, disty = this.seg[i].y - obj.y;
			if (Math.abs(distx) < this.width/2 && Math.abs(disty) < this.height/2) {
				flag = true;
				if (this.interactSeg !== this.seg[i]){
					if (this.interactSeg !== null) this.unfocus(this.interactSeg);
					this.interactSeg = this.seg[i];
					this.stage.toSecond(this.interactSeg);
					this.focus(this.seg[i]);
				}
				break;
			}
		}
	if (!flag && this.interactSeg !== null) {
		this.unfocus(this.interactSeg);
		this.interactSeg = null;
	}
}

Jigsaw.game.Switch.prototype.drawBorder = function(obj) {
	var ctx = this.stage.ctx;
	ctx.save();
	ctx.strokeStyle = "pink";
	ctx.lineWidth = 5.0;
	ctx.strokeRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
	ctx.restore();
}

Jigsaw.game.Switch.prototype.scatter = function(){
	var step = 50 / this.count;
	for (var i in this.seg) {
		this.seg[i].bind_shape(this.width, this.height, (i+1)*step);
		this.seg[i].bind_motion(
				this.game_area.x + this.grid[this.current_pos[this.seg[i].id]].x * this.width + this.width/2,
				this.game_area.y + this.grid[this.current_pos[this.seg[i].id]].y * this.height + this.height/2,
				(i+1) * step);
	}
	if (this.video) {
		this.image.play();
	}
}

Jigsaw.game.Switch.prototype.__checkwin = function(){
	for (var i = 0; i < this.count; i++) {
		if (this.current_pos[this.seg[i].id] != i) return false;
	}
	return true;
}

Jigsaw.game.Switch.prototype.__bonus = function(){
}
