//Base
Jigsaw.Stage = function(canvas, config) {
	//stage vars
	this.canvas = canvas;
	this.ctx = this.canvas.getContext('2d');
	if (config.height) this.canvas.height = config.height;
	if (config.width) this.canvas.width = config.width;

	this.fps = config.fps;
	this.mousePos = null;

	this.objects = [];
	this.count = 0;
	this.time = 0;

	this.renderLink = {
		head: null,
		tail: { prev: null, next: null, inLink: true, scene: this}
	};
	this.renderLink.tail.prev = this.renderLink.head; //TODO maybe needed to be debug

	this.keyStatus = [];
	this.keyAction = [];

	for (var i = 0; i < Jigsaw.def.Keyboard.MAX; i++) {
		this.keyStatus[i] = false;
		this.keyAction[i] = false;
	}

	//event
	this.onmousedown = null;
	this.onmouseup = null;
	this.onmousemove = null;
	this.onmouseout = null;
	this.ondrag = null;
	//this.ondragover = null;
	//this.ondrop = null;

	this.onkeydown = null;
	this.onkeyup = null;

	this.isMouseDown = false;
	this.isContentChanged = true;
	this.running = false;
	this.mainFunc = null;

	if (config.physicsOn) 
		this.isPhysicsOn = config.physicsOn;
	else this.isPhysicsOn = false;

}

Jigsaw.Stage.prototype.addObj = function(obj, _x, _y) {
	this.objects[this.count] = obj;
	this.objects[this.count].scene = this;

	if ( _x !== undefined && _x !== null) obj.x = _x;
	if ( _y !== undefined && _y !== null) obj.y = _y;
	if (obj.buff) {
		obj.buff_changed = true;
		obj.buff_canvas = document.createElement('canvas');
		obj.buff_ctx = obj.buff_canvas.getContext('2d');

		obj.buff_canvas.width = obj.buff_size.w;
		obj.buff_canvas.height = obj.buff_size.h;
	}
	obj.id = this.count;

	if (obj.life != 0) {
		obj.addtime = this.time;
	}

	//renderLink
	//TODO bug when there isn't any objects
	if (this.renderLink.head === null) {
		this.renderLink.head = obj;
		obj.prev = null;
		obj.next = this.renderLink.tail;
		this.renderLink.tail.prev = obj;
	}
	else {
		this.renderLink.tail.prev.next = obj;
		obj.prev = this.renderLink.tail.prev;
		obj.next = this.renderLink.tail;
		this.renderLink.tail.prev = obj;
	}
	obj.inLink = true;
	++this.count;
	this.isContentChanged = true;
}

Jigsaw.Stage.prototype.getMousePos = function(ev) {
	if (ev.pageX || ev.pageY) {
		return {
			x:ev.pageX-canvas.offsetLeft, 
			y:ev.pageY-canvas.offsetTop
		};
	}
	return {
		x:ev.clientX+document.body.scrollLeft-document.body.clientLeft,
		y:ev.clienty+document.body.scrollTop-document.body.clientTop
	}
}

Jigsaw.Stage.prototype.__addEventListener = function(_event, func)
{
	this[_event] = func; //TODO Right??
}

Jigsaw.Stage.prototype.unbindAll = function()
{
	this.canvas.onmousemove = null;
	this.canvas.onmousedown = null;
	this.canvas.onmouseup = null;
	this.canvas.onmouseout = null;

	this.canvas.onkeydown = null;
	this.canvas.onkeyup = null;

	this.canvas.ondrop = null;
}

Jigsaw.Stage.prototype.Initialize = function() {
	var that = this, iterator;
	this.canvas.onmousemove = function(ev) {
		ev = ev || window.event;
		that.mousePos = that.getMousePos(ev);
		if (that.onmousemove !== null)
			that.onmousemove();
		if (that.isMouseDown && that.ondrag !== null) that.ondrag();

		iterator = that.renderLink.tail.prev;
		if (!that.isMouseDown)
		{
			while (iterator !== null)
			{
				if (iterator.id !== undefined) {
				
				if (that.isMouseinObj(iterator))
				{
					if (iterator.status.mouseover == false) {
						iterator.status.mouseover = true;
						if (iterator.events.receive && iterator.events.mousein !== null) iterator.events.mousein();
					}
				}
				else {
					if (iterator.status.mouseover) {
						iterator.status.mouseover = false;
						if (iterator.events.receive && iterator.events.mouseout !== null) iterator.events.mouseout();
					}
				}
				}
				iterator = iterator.prev;
			}
		}
		else {
			while (iterator !== null)
			{
				if (iterator.id !== undefined) {
				if (iterator.status.mousedown)
				{
					if (iterator.events.receive) {
						if (iterator.events.drag !== null) {
							iterator.events.drag();
						}
						break;
					}
				}}
				iterator = iterator.prev;
			}
		}
	}

	this.canvas.onmousedown = function(ev) {
		ev = ev || window.event;
		//TODO Left or Right??
		that.isMouseDown = true;
		var flag = false;
		iterator = that.renderLink.tail.prev;
		while (iterator !== null)
		{
			if (iterator.id !== undefined) {
			if (iterator.status.mouseover && !iterator.status.mousedown)
			{
				iterator.status.mousedown = true;
				if (iterator.events.receive) {
					flag = true;
					if (iterator.events.mousedown !== null) {
						iterator.events.mousedown();
						break;//because there can only be one objects clicked at one time
					}
				}
			}}
			iterator = iterator.prev;
		}
		if (that.onmousedown !== null) that.onmousedown();
	}

	this.canvas.onmouseup = function(ev) {
		var flag = false;
		ev = ev || window.event;
		that.isMouseDown = false;

		iterator = that.renderLink.tail.prev;
		while (iterator !== null)
		{
			if (iterator.id !== undefined) {
				if (iterator.status.mouseover && iterator.status.mousedown)
				{
					flag = true;
					iterator.status.mousedown = false;
					if (iterator.events.receive) {
						if (iterator.events.mouseup !== null) iterator.events.mouseup();
						break;
					}
				}
			}
			iterator = iterator.prev;
		}
		if (!flag && that.onmouseup !== null) that.onmouseup();
	}

	this.canvas.addEventListener("dragover", function(ev){ 
		ev = ev || window.event;
		ev.preventDefault();
	}, true);

	this.canvas.addEventListener("drop", function(ev) {
		ev = ev || window.event;
		iterator = that.renderLink.tail.prev;
		while (iterator !== null)
		{
			if (iterator.id !== undefined) {
				if (iterator.status.mouseover)
				{
					if (iterator.events.receive) {
	   					if (iterator.events.drop!== null) iterator.events.drop(ev);
						break;
					}
				}
			}
			iterator = iterator.prev;
		}
	}, true);

	window.addEventListener('keydown', function(ev){
		ev = ev || window.event;
		if (that.keyStatus[ev.keyCode] != true) {
			that.keyStatus[ev.keyCode] = true;
			that.keyAction[ev.keyCode] = true;
		}
		else that.keyAction[ev.keyCode] = false;
		if (that.onkeydown !== null) that.onkeydown();
		if (ev.keyCode < 112 || ev.keyCode > 123) ev.preventDefault();
	}, true);
	
	window.addEventListener('keyup', function(ev){
		ev = ev || window.event;
		if (that.keyStatus[ev.keyCode] == true) {
			that.keyStatus[ev.keyCode] = false;
			that.keyAction[ev.keyCode] = false;
		}

		if (that.onkeyup !== null) that.onkeyup(ev);
	}, true);

	this.canvas.onmouseout = function(ev) {
		ev = ev || window.event;
		if (that.onmouseout !== null) that.onmouseout();
	}
}

Jigsaw.Stage.prototype.isMouseinObj = function(obj){
	var x = this.mousePos.x, y = this.mousePos.y;
	if (x < obj.x + obj.width/2 && x > obj.x - obj.width/2 && y < obj.y + obj.height/2 && y > obj.y -obj.height/2) return true;
		else return false;
}

Jigsaw.Stage.prototype.Run = function(){
	var that = this;
	this.running = true;
	//if (this.isPhysicsOn) this.physics_render();
	
	setTimeout(function(){
		that.updata();
	}, 1000/this.fps);

	setTimeout(function(){
		that.flush();
	}, 1000/24);
}

Jigsaw.Stage.prototype.physics_render = function() {
	var obj;
	var miu = 0.2;

	//collision 
	for (var i in this.objects) {
		if (this.objects[i].phy) this.objects[i].effect_apply();
	}
	//environment_effect temporarily friction
	//need to improve the algorithm
	for (i in this.objects) {
		if (this.objects[i].phy) {
			obj = this.objects[i];
		/*	
			if (Math.abs(obj.v.x) >= 0.001) obj.a.x -= obj.v.x / 200; 
			if (Math.abs(obj.v.y) >= 0.001) obj.a.y -= obj.v.y / 200 ; 
*/
			obj.v.x += obj.a.x;
			obj.v.y += obj.a.y; 
			
			//obj.a.x = 0;
			//obj.a.y = 0;
			obj.setPos(obj.x + obj.v.x, obj.y + obj.v.y);
			obj.clockwiseRotate(obj.omega);
		}
	}
}

Jigsaw.Stage.prototype.updata = function() {
	var that = this;
	++this.time;
	var obj;
	var iterator_f;
	if (this.mainFunc !== null) this.mainFunc();
	for (var i in this.objects) {
		if (this === null || !this.running) return;
		obj = this.objects[i];//TODO must be modified
		if (obj.life != 0 && this.time - obj.addtime >= obj.life) {
			this.remove(obj);

			obj.func.head = null;
			obj.sfx.head = null;

			this.objects.splice(i,1);
			obj = null;
			--this.count;
		}
		else {
			iterator_f = obj.func.head;
			while (iterator_f !== obj.func.tail) {
				iterator_f.f();
				if (iterator_f.end !== null && iterator_f.end()) {
					iterator_f = obj.unmount_func(iterator_f);
				}
				else {
					iterator_f = iterator_f.next;
				}
			}
			//obj.animationRender();
			obj.twMotionRender();
			obj.twShapeRender();
			obj.twAngleRender();
			if (obj.buff) {
				obj.buffRender();
			}
		}
	}
	if (this.running) setTimeout(function(){that.updata();}, 1000/this.fps);
}

Jigsaw.Stage.prototype.flush = function() {
	var that = this;
	if (this.isContentChanged) {
		this.isContentChanged = false;
		if (this.renderLink.head !== null) {
			for (var iterator = this.renderLink.head; iterator != this.renderLink.tail; iterator = iterator.next)
			{
				if (this === null || !this.running) return;
				if (iterator.id !== undefined && iterator.id !== null) iterator.Render();
				else {
					iterator.f();
					if (iterator.end !== null && iterator.end()) {
						this.remove(iterator);
					}
				}
			}
		}
	}
	if (this.running) setTimeout(function(){that.flush();}, 1000/24);
}

Jigsaw.Stage.prototype.remove = function(obj) {
	if (obj.scene != this) return false;
	if (obj == this.renderLink.head) {
		this.renderLink.head = obj.next;
		this.renderLink.head.prev = null;
	}
	else {
		obj.prev.next = obj.next;
		obj.next.prev = obj.prev;
	}
	obj.inLink = false;
	this.isContentChanged = true;
	return true;
}

Jigsaw.Stage.prototype.insert = function(obj, dest) {
	if (obj.scene != this || dest.scene != this) return false;
	if (obj.inLink || !dest.inLink) return false;
	obj.next = dest;
	obj.prev = dest.prev;

	if (dest != this.renderLink.head) {
		dest.prev.next = obj;
		dest.prev = obj;
	}
	else {
		dest.prev = obj;
		this.renderLink.head = obj;
	}
	obj.inLink = true;
	this.isContentChanged = true;
	return true;
}

Jigsaw.Stage.prototype.toSecond = function(obj) {
	if (!this.remove(obj)) return false;
	if (!this.insert(obj, this.renderLink.tail.prev)) return false;
	this.isContentChanged = true;
	return true;
}

Jigsaw.Stage.prototype.toTop = function(obj) {
	if (!this.remove(obj)) return false;
	if (!this.insert(obj, this.renderLink.tail)) return false;
	this.isContentChanged = true;
	return true;
}

Jigsaw.Stage.prototype.toBottom = function(obj) {
	if (!this.remove(obj)) return false;
	if (!this.insert(obj, this.renderLink.head)) return false;
	this.isContentChanged = true;
	return true;
}

Jigsaw.Stage.prototype.exit = function(obj) {
	this.running = false;
	this.unbindAll();
	for (var i = 0; i < this.objects.count; i++)
		if (this.objects[i].buff) {
			this.objects[i].buff_canvas = null;
		}
}


