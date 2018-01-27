Jigsaw.object.Primitive = function(initialize, config) {
	if (initialize == true)
	{
		this.id = null;

		// life of the object.Primitive null represent the object.Primitive will last until stage ends
		if (config.life === undefined || config.life === null)
			this.life = 0; else this.life = config.life;
		// record the time when the object.Primitive is added to the stage works only when
		// this.life is not null or undefined
		this.addtime = 0;

		// Free Render
		if (config.renderFunc === undefined || config.renderFunc === null)
			this.render = null;
		else this.render = config.renderFunc;

		// suppory physics effect
		if (config.physics === undefined || config.physics === null)
			this.physics = 0; else this.physics = config.physics;

		//buffer
		if (config.buff === undefined || config.buff === null) this.buff = false;
			else this.buff = config.buff;
		this.buff_canvas = null;
		this.buff_ctx = null;
		this.buff_size = {
			w: config.buf_width,
			h: config.buf_height
		};
		if (!this.buff) {
			this.buff_changed = false;
			this.buff_size.width = 0;
			this.buff_size.height = 0;
		}
		else {
			this.buff_changed = true;
			if (this.buff_size.width === null || this.buff_size.width === undefined)
				this.buff_size.width = 0;
			if (this.buff_size.height === null || this.buff_size.height === undefined)
				this.buff_size.height = 0;
		}

		// position of the object.Primitive
		if (config.x === undefined || config.x === null) this.x = 0;
			else this.x = config.x;
		if (config.y === undefined || config.y === null) this.y = 0;
			else this.y = config.y;
		// angle of the object.Primitive
		if (config.angle === undefined || config.angle === null) this.angle = 0;
			else this.angle = config.angle;
		// opacity of the object.Primitive
		if (config.opacity === undefined || config.opacity === null) this.opacity = 1.0;
			else this.opacity = config.opacity;

		this.next = null;
		this.prev = null;
		this.inLink = false;

		this.sfx = {
			head: null,
			tail: {f: null, end: null, prev: null, next: null}
		}; //TODO will be adjusted
		this.sfx.head = this.sfx.tail;
		this.sfx.divide = this.sfx.tail;

		this.func = {
			head: null,
			tail: {f: null, end: null, prev: null, next: null}
		}; //TODO will be adjusted
		this.func.head = this.func.tail;

		this.tween_motion = {
				status: false,
				dest_x: 0,
				dest_y: 0,
				step_x: 0,
				step_y: 0,
				next: null,
				time: 0
		};

		this.tween_angle = {
			status: false,
			dest_ang: 0,
			step_x: 0,
			next: null,
			time: 0
		};

		this.events = {
			receive: true,
			mousein: null,
			mouseout: null,
			mouseover: null,
			mousedown: null,
			mouseup: null,
			drag: null,
			drop: null
		};
		this.status = {
			mouseover: false,
			mousedown: false
		}
		this.scene = null;
	}
}

Jigsaw.object.Primitive.prototype.setPos = function(x, y)
{
	if (x !== undefined && x !== null)
	{
		if (this.x !== x) {
			this.x = x;
			this.scene.isContentChanged = true;
		}
	}
	if (y !== undefined && y !== null)
	{
		if (this.y !== y) {
			this.y = y;
			this.scene.isContentChanged = true;
		}
	}
}

Jigsaw.object.Primitive.prototype.setAngle = function(angle)
{
	if (angle !== undefined && angle !== null)
	{
		if (angle > 360) { //TODO make 360 a constant
			angle = angle % 360;
		}
		if (this.angle !== angle) {
			this.angle = angle;
			this.scene.isContentChanged = true;
			if (this.buff) this.buff_changed = true;
		}
	}
}

Jigsaw.object.Primitive.prototype.clockwiseRotate = function(dx) {
	if (dx !== undefined && dx !== null && dx !== 0) {
		this.setAngle(this.angle + dx);
	}
}

Jigsaw.object.Primitive.prototype.addEventListener = function(event_name, func)
{
	this.events[event_name] = func; //TODO implement the event process as a link
}

Jigsaw.object.Primitive.prototype.twMotionRender = function()
{
	var f;
	if (this.tween_motion.status) {
		if (this.tween_motion.time <= 0)
		{
			this.setPos(this.tween_motion.dest_x, this.tween_motion.dest_y);
			f = this.tween_motion.next;
			this.unbind_motion();
			if (f != null) f();
		}
		else {
			this.setPos(this.x + this.tween_motion.step_x, this.y + this.tween_motion.step_y);
			this.tween_motion.time -= this.scene.fps;
		}
	}
}

Jigsaw.object.Primitive.prototype.twAngleRender = function()
{ //TODO need to be completed
	var f;
	if (this.tween_angle.status) {
		if (this.tween_angle.time <= 0)
		{
			this.setAngle(this.tween_angle.dest_ang);
			f = this.tween_angle.next;
			this.unbind_angle();
			if (f != null) f();
		}
		else {
			this.setAngle(this.angle + this.tween_angle.step_angle);
			this.tween_angle.time -= this.scene.fps;
		}
	}
}

Jigsaw.object.Primitive.prototype.bind_motion = function(dx, dy, time, nextfunc)
{
	this.tween_motion.status = true;
	this.tween_motion.dest_x = dx;
	this.tween_motion.dest_y = dy;
	this.tween_motion.time = time;
	this.tween_motion.next = nextfunc;

	if (time > 0) {
		this.tween_motion.step_x = (dx - this.x) / time * this.scene.fps;
		this.tween_motion.step_y = (dy - this.y) / time * this.scene.fps;
	}
}

Jigsaw.object.Primitive.prototype.unbind_motion = function()
{
	this.tween_motion.status = false;
	this.tween_motion.dest_x = 0;
	this.tween_motion.dest_y = 0;

	this.tween_motion.step_x = 0;
	this.tween_motion.step_y = 0;

	this.tween_motion.time = 0;
	this.tween_motion.next = null;
}

//TODO clockwise
Jigsaw.object.Primitive.prototype.bind_angle = function(d_ang, time, nextfunc)
{
	this.tween_angle.status = true;
	this.tween_angle.dest_ang = d_ang;
	this.tween_angle.time = time;
	this.tween_angle.next = nextfunc;

	if (time > 0) {
		this.tween_angle.step_ang = (d_ang - this.angle) / time * this.scene.fps;
	}
}

Jigsaw.object.Primitive.prototype.unbind_angle = function()
{
	this.tween_angle.status = false;
	this.tween_angle.dest_ang = 0;
	this.tween_angle.step_ang = 0;
	this.tween_angle.time = 0;
	this.tween_angle.next = null;
}

//TODO implement link operation for the func_link and the sfx_link
Jigsaw.object.Primitive.prototype.mount_func = function(f1, f2) { //TODO changed function name here !!!
	if (f1 === undefined || f1 === null) return false;
	if (f2 === undefined) f2 = null;

	var obj = {f: f1, end: f2, prev: null, next: null};

	if (this.func.head === this.func.tail) {
		this.func.head = obj;
		obj.next = this.func.tail;
		obj.prev = null;
		obj.next.prev = obj;
	}
	else {
		obj.next = this.func.tail;
		obj.prev = this.func.tail.prev;
		obj.next.prev = obj;
		obj.prev.next = obj;
	}
	return obj;
}

Jigsaw.object.Primitive.prototype.mount_sfx = function(f1, f2, place) {
	if (f1 === undefined || f1 === null) return false;
	if (f2 === undefined) f2 = null;
	if (place === undefined || place === null) place = true;

	var obj = {f: f1, end: f2, prev: null, next: null};
	//set the render order for an object.Primitive

	if (this.sfx.head === this.sfx.tail) {
		this.sfx.head = obj;
		obj.next = this.sfx.tail;
		obj.prev = null;
		obj.next.prev = obj;
		if (place) this.sfx.divide = obj;
	}
	else {
		if (place) {
			obj.next = this.sfx.tail;
			obj.prev = this.sfx.tail.prev;
			obj.next.prev = obj;
			obj.prev.next = obj;
			if (this.sfx.divide === this.sfx.tail) this.sfx.divide = obj;
		}
		else {
			if (this.sfx.divide === this.sfx.head) {
				obj.next = this.sfx.head;
				obj.prev = null;
				obj.next.prev = obj;
				this.sfx.head = obj;
			}
			else {
				obj.next = this.sfx.divide;
				obj.prev = this.sfx.divide.prev;
				obj.next.prev = obj;
				obj.prev.next = obj;
			}
		}
	}
	return obj;
}

Jigsaw.object.Primitive.prototype.unmount_func = function(iter) {
	var obj;
	if (iter == this.func.head) {
		this.func.head = iter.next;
		this.func.head.prev = null;
		obj = this.func.head;
	}
	else {
		iter.prev.next = iter.next;
		iter.next.prev = iter.prev;
		obj = iter.next;
	}
	return obj;
}

Jigsaw.object.Primitive.prototype.unmount_sfx = function(iter) {
	var obj;
	if (iter === this.sfx.head) {
		this.sfx.head = iter.next;
		this.sfx.head.prev = null;
		obj = this.sfx.head;
	}
	else {
		iter.prev.next = iter.next;
		iter.next.prev = iter.prev;
		obj = iter.next;
	}
	if (this.sfx.divide === iter) this.sfx.divide = iter.next;
	return obj;
}

Jigsaw.object.Image = function(config) {
	//source image
	if (config.img === undefined) this.image = null;
	else this.image = config.img;

	// offset in the source image
	if (config.sx === null || config.sx === undefined) this.sx = 0;
	else this.sx = config.sx;
	if (config.sy === null || config.sy === undefined) this.sy = 0;
	else this.sy = config.sy;

	// source width && height
	if (config.orgh === null || config.orgh === undefined) this.orgh = 0;
	else this.orgh = config.orgh;
	if (config.orgw === null || config.orgw === undefined) this.orgw = 0;
	else this.orgw = config.orgw;

	// destination width && height
	if (config.height === null || config.height === undefined) this.height = 0;
	else this.height = config.height;
	if (config.width === null || config.width === undefined) this.width = 0;
	else this.width = config.width;

	this.tween_shape = {
		status: false,
		dest_w: 0,
		dest_h: 0,
		step_w: 0,
		step_h: 0,
		next: null,
		time: 0
	};

	Jigsaw.object.Primitive.call(this, true,
		{
			life: config.life,
			buff: config.buff,
			buf_width: config.buf_width,
			buf_height: config.buf_height,
			physics: config.physics,
			x: config.x,
			y: config.y,
			angle: config.angle,
			opacity: config.opacity
		});
}

Jigsaw.object.Image.prototype = new Jigsaw.object.Primitive();

Jigsaw.object.Image.prototype.twShapeRender = function() {
	var f;
	if (this.tween_shape.status) {
		if (this.tween_shape.time <= 0)
		{
			this.setSize(this.tween_shape.dest_w, this.tween_shape.dest_h)
				f = this.tween_shape.next;
			this.unbind_shape();
			if (f != null) f();
		}
		else {
			this.setSize(this.width + this.tween_shape.step_w, this.height + this.tween_shape.step_h);
			this.tween_shape.time -= this.scene.fps;
		}
	}
}

Jigsaw.object.Image.prototype.bind_shape = function(dw, dh, time, nextfunc) {
	this.tween_shape.status = true;
	this.tween_shape.dest_w = dw;
	this.tween_shape.dest_h = dh;

	this.tween_shape.time = time;
	this.tween_shape.next = nextfunc;
	if (time > 0) {
		this.tween_shape.step_w = (dw - this.width) / time * this.scene.fps;
		this.tween_shape.step_h = (dh - this.height) / time * this.scene.fps;
	}
}

Jigsaw.object.Image.prototype.unbind_shape = function(){
	this.tween_shape.status = false;
	this.tween_shape.next = false;

	this.tween_shape.dest_w = 0;
	this.tween_shape.dest_h = 0;

	this.tween_shape.step_w = 0;
	this.tween_shape.step_h = 0;

	this.tween_shape.time = 0;
}

Jigsaw.object.Image.prototype.setSize = function(w, h){
	if (w !== null || w !== undefined)
	{
		if (this.width != w) {
			this.scene.isContentChanged = true;
			if (this.buff) this.buff_changed = true;
			this.width = w;
		}
	}
	if (h !== null || h !== undefined)
	{
		if (this.height != h) {
			this.scene.isContentChanged = true;
			if (this.buff) this.buff_changed = true;
			this.height = h;
		}
	}
}

Jigsaw.object.Image.prototype.buffRender = function(){
	if (this.buff_changed)
	{
		this.scene.isContentChanged = true;
		this.buff_changed = false;
		var ctx = this.buff_canvas.getContext('2d');
		ctx.clearRect(0, 0, this.buff_size.w, this.buff_size.h);
		if (this.render !== null) this.render();
		else {
			this._render_(ctx, this.buff_size.w / 2, this.buff_size.h / 2);
		}
	}
}

Jigsaw.object.Image.prototype.Render = function(){
	var iter;
	var ctx = this.scene.ctx;
	if (this.x + this.width/2 <= 0 || this.x - this.width/2 >= this.scene.canvas.width ||
		this.y + this.height/2 <= 0 || this.y - this.height/2>= this.scene.canvas.height) return;
	if (this.buff) {
		var destw, desth;
		destw = this.buff_size.w;
		desth = this.buff_size.h;
		ctx.drawImage(this.buff_canvas,
				0, 0, this.buff_size.w, this.buff_size.h,
				this.x - destw / 2, this.y - desth /2,
				destw, desth);
	}
	else {
		if (this.render !== null) this.render();
		else this._render_(ctx, this.x, this.y);
	}
}

Jigsaw.object.Image.prototype._render_ = function(ctx, dx, dy){
	ctx.save();
	ctx.translate(dx, dy);
	if (this.angle !== 0) ctx.rotate(this.angle / 180 * Math.PI);
	iter = this.sfx.head;
	while (iter !== this.sfx.divide) {
		iter.f();
		if (iter.end !== null && iter.end()) iter = this.unmount_sfx(iter);
		else iter = iter.next;
	}
	var tmpGA = ctx.globalAlpha;
	ctx.globalAlpha = this.opacity;
	if (this.image !== null && this.image !== undefined)
		ctx.drawImage(
				this.image,
				this.sx, this.sy,
				this.orgw, this.orgh,
				-this.width / 2, -this.height / 2,
				this.width, this.height
				);
	ctx.globalAlpha = tmpGA;

	iter = this.sfx.divide;
	while (iter !== this.sfx.tail) {
		iter.f();
		if (iter.end !== null && iter.end()) iter = this.unmount_sfx(iter);
		else iter = iter.next;
	}
	ctx.restore();
}

Jigsaw.object.Rectangle = function(config)
{
	// destination width && height
	if (config.height === null || config.height === undefined) {
		this.orgh = 0;
		this.height = 0;
	}
	else {
		this.orgh = config.height;
		this.height = config.height;
	}
	if (config.width === null || config.width === undefined) {
		//this.orgw = 0;
		this.width = 0;
	}
	else {
		//this.orgw = config.width;
		this.width = config.width;
	}

	//fillcolor && stroke_color of the rectangle
	if (config.fill_color === undefined) this.fill_color = null;
	else this.fill_color = config.fill_color;
	if (config.stroke_color === undefined) this.stroke_color = null;
	else this.stroke_color = config.stroke_color;

	this.tween_shape = {
		status: false,
			dest_w: 0,
			dest_h: 0,
			step_w: 0,
			step_h: 0,
			next: null,
			time: 0
	};

	Jigsaw.object.Primitive.call(this, true,
			{
				life: config.life,
		buff: config.buff,
		physics: config.physics,
		x: config.x,
		y: config.y,
		angle: config.angle,
		opacity: config.opacity
			});
};

Jigsaw.object.Rectangle.prototype = new Jigsaw.object.Primitive();

Jigsaw.object.Rectangle.prototype.twShapeRender = function() {
	var f;
	if (this.tween_shape.status) {
		if (this.tween_shape.time <= 0)
		{
			this.setSize(this.tween_shape.dest_w, this.tween_shape.dest_h)
				f = this.tween_shape.next;
			this.unbind_shape();
			if (f != null) f();
		}
		else {
			this.setSize(this.width + this.tween_shape.step_w, this.height + this.tween_shape.step_h);
			this.tween_shape.time -= this.scene.fps;
		}
	}
}

Jigsaw.object.Rectangle.prototype.bind_shape = function(dw, dh, time, nextfunc) {
	this.tween_shape.status = true;
	this.tween_shape.dest_w = dw;
	this.tween_shape.dest_h = dh;

	this.tween_shape.time = time;
	this.tween_shape.next = nextfunc;
	if (time > 0) {
		this.tween_shape.step_w = (dw - this.width) / time * this.scene.fps;
		this.tween_shape.step_h = (dh - this.height) / time * this.scene.fps;
	}
}

Jigsaw.object.Rectangle.prototype.unbind_shape = function(){
	this.tween_shape.status = false;
	this.tween_shape.next = false;

	this.tween_shape.dest_w = 0;
	this.tween_shape.dest_h = 0;

	this.tween_shape.step_w = 0;
	this.tween_shape.step_h = 0;

	this.tween_shape.time = 0;
}

Jigsaw.object.Rectangle.prototype.setSize = function(w, h){
	if (w !== null || w !== undefined)
	{
		if (this.width != w) {
			this.scene.isContentChanged = true;
			if (this.buff) this.buff_changed = true;
			this.width = w;
		}
	}
	if (h !== null || h !== undefined)
	{
		if (this.height != h) {
			this.scene.isContentChanged = true;
			if (this.buff) this.buff_changed = true;
			this.height = h;
		}
	}
}

Jigsaw.object.Rectangle.prototype.buffRender = function(){
	if (this.buff_changed)
	{
		this.scene.isContentChanged = true;
		this.buff_changed = false;
		var ctx = this.buff_canvas.getContext('2d');
		ctx.clearRect(0, 0, this.buff_size.w, this.buff_size.h);
		if (this.render !== null) this.render();
		else {
			this._render_(ctx, this.buff_size.w / 2, this.buff_size.h / 2);
		}
	}
}

Jigsaw.object.Rectangle.prototype.Render = function(){
	var iter;
	var ctx = this.scene.ctx;
	if (this.x + this.width/2 <= 0 || this.x - this.width/2 >= this.scene.canvas.width ||
		this.y + this.height/2 <= 0 || this.y - this.height/2>= this.scene.canvas.height) return;

	if (this.buff) {
		var destw, desth;
		destw = this.buff_size.w;
		desth = this.buff_size.h;
		ctx.drawImage(this.buff_canvas,
				0, 0, this.buff_size.w, this.buff_size.h,
				this.x - destw / 2, this.y - desth /2,
				destw, desth);
	}
	else {
		if (this.render !== null) this.render();
		else this._render_(ctx, this.x, this.y);
	}
}

Jigsaw.object.Rectangle.prototype._render_ = function(ctx, dx, dy){
	ctx.save();
	ctx.translate(dx, dy);
	if (this.angle !== 0) ctx.rotate(this.angle / 180 * Math.PI);
	iter = this.sfx.head;
	while (iter !== this.sfx.divide) {
		iter.f();
		if (iter.end !== null && iter.end()) iter = this.unmount_sfx(iter);
		else iter = iter.next;
	}
	var tmpGA = ctx.globalAlpha;
	ctx.globalAlpha = this.opacity;

	ctx.beginPath();
	ctx.rect(-this.width/2, -this.height/2, this.width, this.height);
	ctx.closePath();
	if (this.fill_color !== null)
	{
		var tmpFS = ctx.fillStyle;
		ctx.fillStyle = this.fill_color;
		ctx.fill();
		ctx.fillStlye = tmpFS;
	}
	if (this.stroke_color !== null)
	{
		var tmpSS = ctx.strokeStyle;
		ctx.strokeStyle = this.stroke_color;
		ctx.stroke();
		ctx.strokeStyle = tmpSS;
	}

	ctx.globalAlpha = tmpGA;

	iter = this.sfx.divide;
	while (iter !== this.sfx.tail) {
		iter.f();
		if (iter.end !== null && iter.end()) iter = this.unmount_sfx(iter);
		else iter = iter.next;
	}
	ctx.restore();
}

Jigsaw.object.Circle = function(config)
{
	if (config.radius === undefined || config.radius === null) {
		//this.orgr = 1.0;
		this.radius = 1.0;
	}
	else {
		this.radius = config.radius; //TODO smaller than 0??
		//this.orgr = config.radius;
	}

	//fillcolor && stroke_color of the rectangle
	if (config.fill_color === undefined) this.fill_color = null;
		else this.fill_color = config.fill_color;
	if (config.stroke_color === undefined) this.stroke_color = null;
		else this.stroke_color = config.stroke_color;

	this.tween_shape = {
		status: false,
		dest_r: 0,
		step_r: 0,
		next: null,
		time: 0
	};

	Jigsaw.object.Primitive.call(this, true,
		{
			life: config.life,
			buff: config.buff,
			physics: config.physics,
			x: config.x,
			y: config.y,
			angle: config.angle,
			opacity: config.opacity
		});
};

Jigsaw.object.Circle.prototype= new Jigsaw.object.Primitive();

Jigsaw.object.Circle.prototype.twShapeRender = function() {
	var f;
	if (this.tween_shape.status) {
		if (this.tween_shape.time <= 0)
		{
			this.setSize(this.tween_shape.dest_r)
				f = this.tween_shape.next;
			this.unbind_shape();
			if (f != null) f();
		}
		else {
			this.setSize(this.radius + this.tween_shape.step_r);
			this.tween_shape.time -= this.scene.fps;
		}
	}
}

Jigsaw.object.Circle.prototype.bind_shape = function(dr, time, nextfunc) {
	this.tween_shape.status = true;
	this.tween_shape.dest_r = dr;

	this.tween_shape.time = time;
	this.tween_shape.next = nextfunc;
	if (time > 0) {
		this.tween_shape.step_r = (dr - this.radius) / time * this.scene.fps;
	}
}

Jigsaw.object.Circle.prototype.unbind_shape = function(){
	this.tween_shape.status = false;
	this.tween_shape.next = false;

	this.tween_shape.dest_r = 0;
	this.tween_shape.step_r = 0;

	this.tween_shape.time = 0;
}

Jigsaw.object.Circle.prototype.setSize = function(r){
	if (r !== null || r !== undefined)
	{
		if (this.radius != r) {
			this.scene.isContentChanged = true;
			if (this.buff) this.buff_changed = true;
			this.radius = r;
		}
	}
}

Jigsaw.object.Circle.prototype.buffRender = function(){
	if (this.buff_changed)
	{
		this.scene.isContentChanged = true;
		this.buff_changed = false;
		var ctx = this.buff_canvas.getContext('2d');
		ctx.clearRect(0, 0, this.buff_size.w, this.buff_size.h);
		if (this.render !== null) this.render();
		else {
			this._render_(ctx, this.buff_size.w / 2, this.buff_size.h/2);
		}
	}
}

Jigsaw.object.Circle.prototype.Render = function(){
	var iter;
	var ctx = this.scene.ctx;

	if (this.x + this.radius <= 0 || this.x - this.radius >= this.scene.canvas.width ||
		this.y + this.radius <= 0 || this.y - this.radius >= this.scene.canvas.height) return;

	if (this.buff) {
		var destw, desth;
		destw = this.buff_size.w;
		desth = this.buff_size.h;
		ctx.drawImage(this.buff_canvas,
				0, 0, this.buff_size.w, this.buff_size.h,
				this.x - destw / 2, this.y - desth /2,
				destw, desth);
	}
	else {
		if (this.render !== null) this.render();
		else this._render_(ctx, this.x, this.y);
	}
}

Jigsaw.object.Circle.prototype._render_ = function(ctx, dx, dy){
	ctx.save();
	ctx.translate(dx, dy);
	if (this.angle !== 0) ctx.rotate(this.angle / 180 * Math.PI);
	iter = this.sfx.head;
	while (iter !== this.sfx.divide) {
		iter.f();
		if (iter.end !== null && iter.end()) iter = this.unmount_sfx(iter);
		else iter = iter.next;
	}
	var tmpGA = ctx.globalAlpha;
	ctx.globalAlpha = this.opacity;

	ctx.beginPath();
	ctx.arc(0, 0, this.radius, 0, Math.PI*2);
	ctx.closePath();
	if (this.fill_color !== null)
	{
		var tmpFS = ctx.fillStyle;
		ctx.fillStyle = this.fill_color;
		ctx.fill();
		ctx.fillStlye = tmpFS;
	}
	if (this.stroke_color !== null)
	{
		var tmpSS = ctx.strokeStyle;
		ctx.strokeStyle = this.stroke_color;
		ctx.stroke();
		ctx.strokeStyle = tmpSS;
	}

	ctx.globalAlpha = tmpGA;

	iter = this.sfx.divide;
	while (iter !== this.sfx.tail) {
		iter.f();
		if (iter.end !== null && iter.end()) iter = this.unmount_sfx(iter);
		else iter = iter.next;
	}
	ctx.restore();
}


Jigsaw.object.StaticText = function(config)
{
	if (config.str === undefined || config.str === null) this.text = "";
		else this.text = config.str;
	if (config.fill_color === undefined) this.fill_color = null;
		else this.fill_color = config.fill_color;
	if (config.stroke_color === undefined) this.stroke_color = null;
	else this.stroke_color = config.stroke_color;

	if (config.font !== undefined && config.font !== null) this.font = config.font; //TODO define the default font
	if (config.width === undefined || config.width === null) this.width = 0;
	else this.width = config.width;
	if (config.height=== undefined || config.height=== null) this.height= 0;
	else this.height = config.height;
	Jigsaw.object.Primitive.call(this, true,
	{
		life: config.life,
		buff: config.buff,
		physics: config.physics,
		x: config.x,
		y: config.y,
		angle: config.angle,
		opacity: config.opacity
	});
}

Jigsaw.object.StaticText.prototype.Render = function(){
	var iter;
	var ctx = this.scene.ctx;
	if (obj.x + obj.width/2 <= 0 || obj.x - obj.width/2 >= this.canvas.width ||
		obj.y + obj.height/2 <= 0 || obj.y - obj.height/2>= this.canvas.height) return;
	if (this.buff) {
		var destw, desth;
		destw = this.buff_size.w;
		desth = this.buff_size.h;
		ctx.drawImage(this.buff_canvas,
				0, 0, this.buff_size.w, this.buff_size.h,
				this.x - destw / 2, this.y - desth /2,
				destw, desth);
	}
	else {
		if (this.render !== null) this.render();
		else this._render_(ctx, this.x, this.y);
	}
}


Jigsaw.object.StaticText.prototype= new Jigsaw.object.Primitive();

Jigsaw.object.StaticText.prototype.setText = function(text) {
	if (text === null || text === undefined) return;
	if (text === this.text) return;
	else {
		this.text = text;
		this.scene.isContentChanged = true;
	}
}

Jigsaw.object.StaticText.prototype.twShapeRender = function()
{
}

Jigsaw.object.StaticText.prototype.Render = function(){
	var ctx = this.scene.ctx;
	this._render_(ctx, this.x, this.y);
}

Jigsaw.object.StaticText.prototype._render_ = function(ctx, dx, dy){
	ctx.save();
	ctx.translate(dx, dy);
	if (this.angle !== 0) ctx.rotate(this.angle / 180 * Math.PI);
	iter = this.sfx.head;
	while (iter !== this.sfx.divide) {
		iter.f();
		if (iter.end !== null && iter.end()) iter = this.unmount_sfx(iter);
		else iter = iter.next;
	}
	ctx.globalAlpha = this.opacity;
	ctx.font = this.font;
	if (this.width == 0) this.width = ctx.measureText(this.text).width;

	ctx.lineWidth = 2.0;
	if (this.fill_color !== null)
	{
		ctx.fillStyle = this.fill_color;
		ctx.fillText(this.text, -this.width / 2, this.height / 2);
	}
	if (this.stroke_color !== null)
	{
		ctx.strokeStyle = this.stroke_color;
		ctx.strokeText(this.text, -this.width/2, this.height/2);
	}

	iter = this.sfx.divide;
	while (iter !== this.sfx.tail) {
		iter.f();
		if (iter.end !== null && iter.end()) iter = this.unmount_sfx(iter);
		else iter = iter.next;
	}
	ctx.restore();
}
