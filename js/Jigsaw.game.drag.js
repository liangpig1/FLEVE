Jigsaw.game.Drag = function(config) {
	this.stage = null;
	this.game_area = config.game_area;
	this.ctrl_area = config.control_area;
	this.canvas = config.canvas;

	this.image = config.image;
	if (config.randomE !== undefined && config.randomE !== null) 
		this.randomE = true; else this.randomE = false;

	this.row = config.seg.row;
	this.col = config.seg.col;
	this.count = this.row * this.col;
	this.fps = config.fps;

	this.drag = {
		start: {x:0,y:0},
		end: { x:0, y:0}
	};

	this.startPos = [];
	
	this.seg = [];
	this.current_pos = [];
	this.matrix = [];
	this.curve = [];

	this.subSeg = [];
	this.insub = [];
	this.subLength = null;

	this.active = null;
	this.step = 0;
	this.set = 0;
	this.game_status = {
		running: false
	};
}

Jigsaw.game.Drag.prototype.GameStart = function() {
	var i, j, k;
	var that = this;
	var bw, bh;

	this.width = this.game_area.w / this.col * 4/5;
	this.height = this.game_area.h / this.row * 4/5;
	if (this.randomE) {
		bw = ~~(this.width * 2);
		bh = ~~(this.height * 2);
	}
	else {
		bw = Math.sqrt(this.width * this.width + this.height * this.height);
		bh = bw;
	}

	for (i = 0; i < this.count; i++){
		this.matrix[i] = [];
		for (j = 0; j < this.count; j++) this.matrix[i][j] = false;
	}

	for (i = 0; i < this.row; i++) {
		this.seg[i] = [];
		if (this.randomE) this.curve[i] = [];
		for (j = 0; j < this.col; j++)
		{
			this.seg[i][j] = new Jigsaw.object.Image({
				sx: j*this.image.width / this.col ,
				sy: i*this.image.height / this.row,
				orgw: this.image.width/this.col,
				orgh: this.image.height/this.row,
				width: this.width,
				height: this.height,
				image: this.image,
				buff: true,
				buf_width: bw,
				buf_height: bh 
			});
			if (this.randomE) {
				this.curve[i][j] = [];
				for (k = 0; k < 4; k++) {
					this.curve[i][j][k] = {
						set: false,
						start: { x: 0, y: 0},
						ctrl1: { x: 0, y: 0},
						ctrl2: { x: 0, y: 0},
						end: { x: 0, y: 0}
					}
				}
			}
		}
	}

	this.stage = new Jigsaw.Stage(this.canvas, {
		height: this.canvas.height,
	width: this.canvas.width,
	fps: this.fps,
	});
	this.menu = new Jigsaw.game.menu(this);

	var that = this;
	for (i = 0; i < this.row ; i++)
		for (j = 0; j < this.col; j++)
		{
			this.stage.addObj(this.seg[i][j]);
			this.current_pos[this.seg[i][j].id] = i * this.col + j;
			if (this.randomE) {
				for (k = 0; k < 4; k++){
					if (!this.curve[i][j][k].set) 
						this.splitByBezier(k, i, j);
				}
				this.seg[i][j].render = function(obj){
					return function(){
						that.drawByBezier(obj);
					}
				}(this.seg[i][j]);
			}
		}
	this.shuffle();

	for (i = 0; i < this.row; i++)
		for (j = 0; j < this.col; j++)
		{
			this.seg[i][j].addEventListener("mousedown", function(x, y){
				return function(){
					var i, j;
					var op, ed;
					var obj;
					for (var i = 0; i < that.count; i++) {
						that.insub[i] = false;
					}

					that.active =  that.seg[x][y];
					that.drag.start = that.stage.mousePos;

					op = -1;
					ed = 0;
					that.subSeg[0] = that.seg[x][y];
					that.startPos[x * that.col + y] = { 
						x: that.seg[x][y].x, 
						y: that.seg[x][y].y
					};
					that.insub[x * that.col + y] = true; 
					that.stage.toTop(that.seg[x][y]);

					while (op < ed) {
						++op;
						obj = that.subSeg[op];
						for (i = 0; i < that.row; i++)
							for (j = 0; j < that.col; j++) 
								if (that.matrix[that.current_pos[obj.id]][i * that.col+ j] && !that.insub[i*that.col+j]){
									++ed;
									that.subSeg[ed] = that.seg[i][j];
									that.startPos[i*that.col+j] = { 
										x: that.seg[i][j].x,
										y: that.seg[i][j].y
									}
									that.insub[i*that.col+j] = true; 
									that.stage.toSecond(that.seg[i][j]);
								}
					}
					that.subLength = ed;
				};
			}(i,j));

			this.seg[i][j].addEventListener("mouseup", function(x, y){
				return function(){
					that.detect(that.seg[x][y]);
				};
			}(i,j));

			this.seg[i][j].addEventListener("drag", function(x){
				return function(){
					that.drag.end = that.stage.mousePos;
					var distx = that.drag.end.x - that.drag.start.x,
					disty = that.drag.end.y - that.drag.start.y;
					for (var i = 0; i <= that.subLength; i++) that.place(that.subSeg[i], distx, disty);
				}
			}(i,j));
		}

	this.game_status.running = true;
	this.stage.Initialize();
	this.stage.Run();
}

Jigsaw.game.Drag.prototype.splitByBezier = function(k, y, x) {
	bPara = [];
	flat = false;
	var h;
	switch (k)
	{
		case 0:
			{
				if ( y == 0) flat = true;
				bPara = this.lineBezier(-this.width/2, -this.height/2, this.width/2, -this.height/2, false, flat);
				break;
			}
		case 1:
			{
				if ( x == this.col - 1) flat = true;
				bPara = this.lineBezier(this.width/2, -this.height/2, this.width/2, this.height/2, true, flat);
				break;
			}
		case 2: 
			{
				if (y == this.row - 1) flat = true;
				bPara = this.lineBezier(this.width/2, this.height/2, -this.width/2, this.height/2, false, flat);
				break;
			}
		case 3:
			{
				if ( x == 0) flat = true;
				bPara = this.lineBezier(-this.width/2, this.height/2, -this.width/2, -this.height/2, true, flat);
				break;
			}
	}

	this.curve[y][x][k].set = true;
	this.copyBezierFormat(this.curve[y][x][k], bPara);
//Complement the BezierCurve
	switch(k)
	{
		case 0: 
			{
				if ( y != 0) {
					this.curve[y-1][x][2].set = true;
					this.symcopyBezierFormat(this.curve[y-1][x][2], this.curve[y][x][0]);
					this.curve[y-1][x][2].start.y += this.height;
					this.curve[y-1][x][2].ctrl1.y += this.height;
					this.curve[y-1][x][2].ctrl2.y += this.height;
					this.curve[y-1][x][2].end.y += this.height;
				}
				break;
			}
		case 2:
			{
				if ( y != this.row - 1) {
					this.curve[y+1][x][0].set = true;
					this.symcopyBezierFormat(this.curve[y+1][x][0], this.curve[y][x][2]);
					this.curve[y+1][x][0].start.y -= this.height;
					this.curve[y+1][x][0].ctrl1.y -= this.height;
					this.curve[y+1][x][0].ctrl2.y -= this.height;
					this.curve[y+1][x][0].end.y -= this.height;
				}
				break;
			}
		case 3:
			{
				if ( x != 0) {
					this.curve[y][x-1][1].set = true;
					this.symcopyBezierFormat(this.curve[y][x-1][1], this.curve[y][x][3]);
					this.curve[y][x-1][1].start.x += this.width;
					this.curve[y][x-1][1].ctrl1.x += this.width;
					this.curve[y][x-1][1].ctrl2.x += this.width;
					this.curve[y][x-1][1].end.x += this.width;
				}
			}
		case 1:
			{
				if ( x != this.col - 1) {
					this.curve[y][x+1][3].set = true;
					this.symcopyBezierFormat(this.curve[y][x+1][3], this.curve[y][x][1]);
					this.curve[y][x+1][3].start.x -= this.width;
					this.curve[y][x+1][3].ctrl1.x -= this.width;
					this.curve[y][x+1][3].ctrl2.x -= this.width;
					this.curve[y][x+1][3].end.x -= this.width;
				}
			}
	}
}

Jigsaw.game.Drag.prototype.copyBezierFormat = function(lhs, rhs) 
{
	lhs.start.x = rhs.start.x;
	lhs.start.y = rhs.start.y;

	lhs.end.x = rhs.end.x;
	lhs.end.y = rhs.end.y;

	lhs.ctrl1.x = rhs.ctrl1.x;
	lhs.ctrl1.y = rhs.ctrl1.y;

	lhs.ctrl2.x = rhs.ctrl2.x;
	lhs.ctrl2.y = rhs.ctrl2.y;
}

Jigsaw.game.Drag.prototype.symcopyBezierFormat = function(lhs, rhs) 
{
	lhs.start.x = rhs.end.x;
	lhs.start.y = rhs.end.y;

	lhs.end.x = rhs.start.x;
	lhs.end.y = rhs.start.y;

	lhs.ctrl1.x = rhs.ctrl2.x;
	lhs.ctrl1.y = rhs.ctrl2.y;

	lhs.ctrl2.x = rhs.ctrl1.x;
	lhs.ctrl2.y = rhs.ctrl1.y;
}


Jigsaw.game.Drag.prototype.lineBezier = function(x1, y1, x2, y2, vertical, flat) {
	var sx, sy, c1x, c1y, c2x, c2y, ex, ey;
	var seed = getRandom(0, 100);
	var l_ratio = 0.3;
	var w_ratio = 0.25;
	if (vertical) {
		if (flat) {
			return {start: {x: x1, y:y1}, ctrl1: {x:x1, y:y1}, ctrl2: {x: x2, y: y2}, end: {x:x2, y:y2}};
		}
		else {
			sx = x1;
			sy = y1 * (1 - l_ratio) + y2 * l_ratio;
			ex = sx;
			ey = y2 * (1 - l_ratio) + y1 * l_ratio;
			c1y = sy;
			c2y = ey;
			if (seed < 49) c1x = x1 + this.width * w_ratio; else c1x = x1 - this.width * w_ratio;
			c2x = c1x; 
			return {start: { x: sx, y: sy}, ctrl1: { x: c1x, y: c1y}, ctrl2: { x: c2x, y: c2y}, end: { x: ex, y: ey}};
		}
	}
	else {
		if (flat) {
			return {start: {x:x1, y:y1}, ctrl1:{x:x1, y:y1}, ctrl2: {x:x2, y:y2}, end: {x:x2, y:y2}};
		}
		else {
			sy = y1;
			sx = x1 * (1 - l_ratio) + x2 * l_ratio;
			ey = sy;
			ex = x2 * (1 - l_ratio) + y1 * l_ratio;
			c1x = sx;
			c2x = ex;
			if (seed < 49) c1y = y1 + this.height * w_ratio; else c1y = y1 - this.height * w_ratio;
			c2y = c1y;
			return {start: { x: sx, y: sy}, ctrl1: { x: c1x, y: c1y}, ctrl2: { x: c2x, y: c2y}, end: { x: ex, y: ey}};
		}
	}
}

Jigsaw.game.Drag.prototype.drawByBezier = function(obj)
{
	var rect = [{ x: -obj.width / 2, y: -obj.height / 2}, { x: obj.width / 2, y: -obj.height / 2}, 
		{ x: obj.width / 2, y: obj.height / 2}, { x: -obj.width / 2, y: obj.height / 2}];

	var i = Math.floor(this.current_pos[obj.id] / this.col), j = this.current_pos[obj.id] % this.col;
	var scx, scy;
	var sx, sy, sw, sh;
	var dx, dy, dw, dh;

	var r_w = obj.orgw / obj.width;
	var r_h = obj.orgh / obj.height;

	dx = 0;
	dy = 0;
	dw = obj.buff_size.w;
	dh = obj.buff_size.h;

	sw = dw * r_w;
	sh = dh * r_h;
	scx = obj.sx + obj.orgw / 2;
	scy = obj.sy + obj.orgh / 2;
	sx = scx - sw / 2;
	sy = scy - sh / 2;

	if (sx < 0) {
		sw += sx;
		dw += sx / r_w;
		dx -= sx / r_w;
		sx = 0;
	}
	if (sx + sw > obj.image.width) {
		dw -= (sx + sw - obj.image.width) / r_w;
		sw -= (sx + sw - obj.image.width);
	}

	if (sy < 0) {
		sh += sy;
		dh += sy / r_h;
		dy -= sy / r_h;
		sy = 0;
	}
	if (sy + sh > obj.image.height) {
		dh -= (sy + sh - obj.image.height) / r_h;
		sh -= (sy + sh - obj.image.height);
	}
	ctx = obj.buff_ctx;
	ctx.save();
	ctx.strokeStyle = "pink";
	ctx.lineWidth = 5.0;
	ctx.translate(obj.buff_size.w / 2, obj.buff_size.h / 2);
	ctx.beginPath();
		ctx.moveTo(rect[0].x, rect[0].y);
		for (var k = 0; k < 4; k++)
		{
			ctx.lineTo(this.curve[i][j][k].start.x, this.curve[i][j][k].start.y);
			ctx.bezierCurveTo(this.curve[i][j][k].ctrl1.x, this.curve[i][j][k].ctrl1.y,
				this.curve[i][j][k].ctrl2.x, this.curve[i][j][k].ctrl2.y,
				this.curve[i][j][k].end.x, this.curve[i][j][k].end.y);
			if (k < 3) ctx.lineTo(rect[k+1].x, rect[k+1].y);
		}
	ctx.closePath();
	if (this.game_status.running) ctx.stroke();
	ctx.clip();
	ctx.globalAlpha = obj.opacity;
	ctx.drawImage(obj.image, sx, sy, sw, sh, dx - obj.buff_size.w/2, dy - obj.buff_size.h/2, dw, dh);
	ctx.restore();
}

Jigsaw.game.Drag.prototype.shuffle = function() {
	for (var i = 0; i < this.row; i++) 
		for (var j = 0; j < this.col; j++) {
			this.seg[i][j].x = getRandom(0, 2*this.game_area.x);
			this.seg[i][j].y = getRandom(0, this.game_area.h - this.height/2);
			if (this.seg[i][j].x >= this.game_area.x) this.seg[i][j].x += (this.game_area.w - this.game_area.x);
		}
}

Jigsaw.game.Drag.prototype.adjacent = function(a, b, p) {
	var x, y;
	var d_x = (b.sx - a.sx) / a.orgw * a.width, 
		d_y = (b.sy - a.sy) / a.orgh * a.height;

	if (Math.abs(d_x) > this.width) return false; 
	if (Math.abs(d_y) > this.height) return false;
	if (d_x != 0 && d_y != 0) return false;

	x = a.x + d_x;
	y = a.y + d_y;

	if (Math.abs(b.x - x) <= this.width / 5 && Math.abs(b.y - y) <= this.height / 5) return true;
	return false;
}

Jigsaw.game.Drag.prototype.detect = function(obj) {
	var i, j, id;
	var x, y;
	var dir = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	var flag = false;
	var obj;
	this.set = this.subLength + 1;
	var op, ed;

	for (i = 0; i <= this.subLength; i++) {
		id = this.current_pos[this.subSeg[i].id];
		for (j = 0; j < 4; j++) {
			x = id % this.col + dir[j][1];
			y = ~~(id / this.col) + dir[j][0];
			if (x >= 0 && x < this.col && y >= 0 && y < this.row) {
				if (!this.matrix[id][y * this.col + x] &&this.adjacent(this.subSeg[i], this.seg[y][x]))
				{
					this.matrix[id][y * this.col + x] = true;
					this.matrix[y * this.col + x][id] = true;
					this.stage.toSecond(this.seg[y][x]);
					flag = true;
				}
			}
		}
	}
	if (flag) {
		op = -1;
		ed = this.subLength;
		while (op < ed) {
			++op;
			id = this.current_pos[this.subSeg[op].id];
			for (j = 0; j < 4; j++) {
				x = id % this.col + dir[j][1];
				y = ~~(id / this.col) + dir[j][0];
				if (x >= 0 && x < this.col && y >= 0 && y < this.row) {
					if (!this.insub[y * this.col+ x] && this.matrix[id][y * this.col + x]){
						++ed;
						++this.set;
						this.insub[y * this.col + x] = true;
						this.subSeg[ed] = this.seg[y][x];
						this.autoAlign(this.subSeg[op], this.seg[y][x])
					}
				}
			}
		}
	}
}

Jigsaw.game.Drag.prototype.autoAlign = function(obj_src, obj) {
	var x, y, d_x, d_y;
	d_x = (obj.sx - obj_src.sx)/obj.orgw * obj.width; 
	d_y = (obj.sy - obj_src.sy)/obj.orgh * obj.height;

	x = obj_src.x + d_x;
	y = obj_src.y + d_y;
	obj.setPos(x, y);
}
Jigsaw.game.Drag.prototype.place = function(obj, offsetx,offsety) {
	obj.setPos(this.startPos[this.current_pos[obj.id]].x + offsetx, this.startPos[this.current_pos[obj.id]].y + offsety);
}

Jigsaw.game.Drag.prototype.focus = function(obj) {
	obj.bind_shape(this.width * 1.1, this.height * 1.1, 100);
}

Jigsaw.game.Drag.prototype.unfocus = function(obj) {
	obj.bind_shape(this.width, this.height, 100);
	this.detect(obj);
	this.active = null;
}

Jigsaw.game.Drag.prototype.__checkwin = function() {
	if (this.set == this.count) return true;
}

Jigsaw.game.Drag.prototype.__win = function() {
	var x = this.stage.mousePos.x,
		y = this.stage.mousePos.y;
	var that = this;

	this.game_status.running = false;
	var wave = new Jigsaw.object.Circle({
			radius: 20,
			life: 200,
			fill_color: "rgba(255,255,255,0)"
	});
	this.stage.addObj(wave, x, y);
	wave.events.receive = false;
	var l = Math.sqrt(this.game_area.w * this.game_area.w+ this.game_area.h * this.game_area.h);
	wave.bind_shape(l, 1000, function(){wave.bind_shape(10, 120);});
	wave.mount_func(function(){
			var radgrad = that.stage.ctx.createRadialGradient(
				0, 0, 0.0,
				0, 0, wave.radius);
			radgrad.addColorStop(0, 'rgba(255,255,255,0)');
			radgrad.addColorStop(1, 'rgba(255,255,255,0.2)');
			wave.fill_color = radgrad;
		},null);
	for (var i = 0; i < this.row; i++) 
		for (var j = 0; j < this.col; j++)
		{
			this.seg[i][j].events.receive = false;
			this.seg[i][j].mount_func(function(obj){
				return function(){ 
					obj.buff_changed = true;
					obj.opacity -= 0.1;
				};
			}(this.seg[i][j]), function(obj){
				return function(){ 
					if (obj.opacity <= 0.5) {
						obj.buff_changed = true;
						obj.opacity = 0.5;
						return true;
					}
				};
			}(this.seg[i][j]));
		}
}
