// base section
var canvas = null;
var cnt_img_loaded = 0;
var cnt_img = 8;
var menu;
var game;
var cfg;

//image to be loaded
var img_bkg; 
var img_btn;
var img_sidebar;
var img_panel;
var img_mask;
var img_nav;
var img_grid_adj;
var img_game_start;

var img_puz;

// background object
var obj_bkg;
var obj_mask;

// sidebar object
var obj_sidebar;
var obj_btn_start;
var obj_btn_opt;
var obj_btn_switch;
var obj_btn_slide;
var obj_btn_drag;
var obj_btn_back;

// panel object
var obj_panel;
var obj_frame;
var obj_container;
var obj_btn_prevpuz;
var obj_btn_nextpuz;
var obj_btn_inc_x;
var obj_btn_dec_x;
var obj_btn_inc_y;
var obj_btn_dec_y;
var obj_btn_game_start;

var obj_panel_search;
var obj_btn_search;
var obj_images_search = [];

var video;
var video_loaded = false;

var list_objects;

var game_fps;
var sidebar_main;
var sidebar_sub;
var panel_main;
var image_loaded;

var layout = { 
	off: [],
	on: []
};

//special fx
var grid_paint;

//
var current_puzzle_id;
var max_puzzle_id;

var puz_row = 3, puz_col = 3;
var min_row = 3, min_col = 3;
var max_row = 8, max_col = 8;

var current_sidebar_id = 0;
//var current_panel_id = 0;
var game_mode = 0;

function menu_init() {
	var obj;
	current_sidebar_id = 1;
	current_puzzle_id = 0;
	max_puzzle_id = 5;
	image_loaded = false;

	cfg = {
		height: window.screen.availHeight,
		width: window.screen.availWidth,
		fps: 40,	//TODO interact every 50ms
	};
	menu  = new Jigsaw.Stage(canvas, cfg);
	img_puz = new Image();

	obj_bkg = new Jigsaw.object.Image({
		sx: 0, sy: 0, orgh: img_bkg.height, orgw: img_bkg.width, 
			img: img_bkg, //info about the image
			width: img_bkg.width,
			height: img_bkg.height
	});
	obj_sidebar = new Jigsaw.object.Image({
		sx: 0, sy: 0, orgh: img_sidebar.height, orgw: img_sidebar.width,
				img: img_sidebar,
				width: img_sidebar.width,
				height: img_bkg.height
	});

	obj_btn_start = new Jigsaw.object.Image({
		sx: 0, sy: 0, orgh: img_btn.height/4, orgw: img_btn.width/2,
				  img: img_btn,
				  width: img_btn.width/2,
				  height: img_btn.height/4
	});

	obj_btn_opt = new Jigsaw.object.Image({
		sx: 0, sy: img_btn.height/4, orgh: img_btn.height/4, orgw: img_btn.width/2,
				img: img_btn,
				width: img_btn.width/2,
				height: img_btn.height/4
	});

	obj_btn_back = new Jigsaw.object.Image({
		sx: 0, sy: img_btn.height/2, orgh: img_btn.height/4, orgw: img_btn.width/2,
				 img: img_btn,
				 width: img_btn.width/2,
				 height: img_btn.height/4
	});

	obj_btn_switch = new Jigsaw.object.Image({
		sx: img_btn.width/2, sy: 0, orgh: img_btn.height/4, orgw: img_btn.width/2,
				   img: img_btn,
				   width: img_btn.width/2,
				   height: img_btn.height/4
	});

	obj_btn_slide = new Jigsaw.object.Image({
		sx: 0, sy: img_btn.height*3/4, orgh: img_btn.height/4, orgw: img_btn.width/2,
				  img: img_btn,
				  width: img_btn.width/2,
				  height: img_btn.height/4
	});

	obj_btn_drag = new Jigsaw.object.Image({
		sx: img_btn.width/2, sy: img_btn.height/4, orgh: img_btn.height/4, orgw: img_btn.width/2,
				 img: img_btn,
				 width: img_btn.width/2,
				 height: img_btn.height/4
	});

	obj_mask = new Jigsaw.object.Image({
		sx:0, sy: 0, orgh: img_mask.height, orgw: img_mask.width,
			 img: img_mask,
			 width: img_mask.width,
			 height: img_mask.height
	});

	obj_panel = new Jigsaw.object.Image({
		sx: 0, sy: 0, orgh: img_panel.height, orgw: img_panel.width,
			  img: img_panel,
			  width: img_panel.width,
			  height: img_panel.height*1.2
	});

	obj_frame = new Jigsaw.object.Rectangle({
		width: obj_panel.width * 0.8,
			  height: obj_panel.height * 0.7,
			  fill_color: "pink",
			  stroke_color: null
	});

	obj_container = new Jigsaw.object.Image({
		width: obj_frame.width,
				  height: obj_frame.height,
				  img: null
	});

	obj_btn_prevpuz = new Jigsaw.object.Image({
		sx: img_nav.width/2, sy: 0, orgw: img_nav.width/2, orgh: img_nav.height/2,
					img: img_nav,
					width: img_nav.width/2,
					height: img_nav.height/2
	});

	obj_btn_nextpuz = new Jigsaw.object.Image({
		sx: 0, sy: 0, orgw: img_nav.width/2, orgh: img_nav.height/2,
					img: img_nav,
					width: img_nav.width/2,
					height: img_nav.height/2
	});

	obj_btn_inc_x = new Jigsaw.object.Image({
		sx: img_grid_adj.width/4, sy: 0, orgw: img_grid_adj.width/4, orgh: img_grid_adj.height/3,
				  img: img_grid_adj,
				  width: img_grid_adj.width/4,
				  height:img_grid_adj.height/3
	});

	obj_btn_dec_x = new Jigsaw.object.Image({
		sx: 0, sy: 0, orgw: img_grid_adj.width/4, orgh: img_grid_adj.height/3,
				  img: img_grid_adj,
				  width: img_grid_adj.width/4,
				  height:img_grid_adj.height/3
	});

	obj_btn_inc_y = new Jigsaw.object.Image({
		sx: img_grid_adj.width/2, sy: 0, orgw: img_grid_adj.width/4, orgh: img_grid_adj.height/3,
				  img: img_grid_adj,
				  width: img_grid_adj.width/4,
				  height:img_grid_adj.height/3
	});

	obj_btn_dec_y = new Jigsaw.object.Image({
		sx: img_grid_adj.width * 3/4, sy: 0, orgw: img_grid_adj.width/4, orgh: img_grid_adj.height/3,
				  img: img_grid_adj,
				  width: img_grid_adj.width/4,
				  height:img_grid_adj.height/3
	});

	obj_btn_game_start = new Jigsaw.object.StaticText({
		str: "START",
					   fill_color: "rgb(255,255,255)",
					   font: "800 50px/2 cursive, sans-serif",
					   height: 40,
					   width: 184
	});
	obj_btn_search =  new Jigsaw.object.StaticText({
		str: "SEARCH",
				   fill_color: "rgb(255,255,255)",
			font: "800 50px/2 cursive, sans-serif",
			height: 40,
			width: 200
		});
	obj_panel_search = new Jigsaw.object.Image({
		sx: 0, sy: 0, orgh: img_panel.height, orgw: img_panel.width,
					 img: img_panel,
					 width: img_panel.width / 3 ,
					 height: img_panel.height * 1.2
	});

	for (i = 0; i < 4; i++) {
		obj_images_search[i] = new Jigsaw.object.Image({
			fill_color: "black",
			height: obj_panel_search.height / 4.2
		});
	}

	assign();
	for (var i in list_objects) {
		menu.addObj(list_objects[i]);
	}

	//define layout
	layout.on[obj_bkg.id] = {x: obj_bkg.width/2, y: obj_bkg.height/2};
	layout.off[obj_bkg.id] = {x: obj_bkg.width/2, y: obj_bkg.height/2};
	layout.on[obj_mask.id] = {x: cfg.width - obj_sidebar.width * 0.95, y: obj_mask.height/2};
	layout.off[obj_mask.id] = {x: cfg.width - obj_sidebar.width * 0.95, y: obj_mask.height/2};

	layout.on[obj_sidebar.id] = {x: cfg.width - obj_sidebar.width/2, y: obj_sidebar.height/2};
	layout.on[obj_btn_start.id] = {x: cfg.width * 0.79, y: cfg.height/3};
	layout.on[obj_btn_opt.id] = {x:cfg.width*0.81, y:cfg.height/2};
	layout.on[obj_btn_back.id] = {x:cfg.width * 0.79, y: cfg.height * 0.7};
	layout.on[obj_btn_slide.id] = {x: cfg.width * 0.75, y: cfg.height*0.22};
	layout.on[obj_btn_switch.id] = {x: cfg.width * 0.79, y: cfg.height*0.36};
	layout.on[obj_btn_drag.id] = {x: cfg.width * 0.81, y: cfg.height*0.5};

	layout.on[obj_panel.id] = {x: cfg.width * 0.45, y: cfg.height * 0.4 };
	layout.on[obj_frame.id] = {x: layout.on[obj_panel.id].x * 0.9, y: layout.on[obj_panel.id].y * 0.9};
	layout.on[obj_container.id] = {x: layout.on[obj_frame.id].x, y: layout.on[obj_frame.id].y};

	layout.on[obj_btn_prevpuz.id] = {x: layout.on[obj_container.id].x - obj_btn_prevpuz.width/2 - 20, 
		y:layout.on[obj_container.id].y - obj_container.height/2 - obj_btn_prevpuz.height/2}; 
	layout.on[obj_btn_nextpuz.id] = {x: layout.on[obj_container.id].x + obj_btn_nextpuz.width/2 + 20, 
		y:layout.on[obj_container.id].y - obj_container.height/2 - obj_btn_nextpuz.height/2}; 

	layout.on[obj_btn_inc_y.id] = {x: layout.on[obj_container.id].x + obj_container.width/2 + obj_btn_inc_y.width/2,
		y:layout.on[obj_container.id].y - obj_btn_inc_y.height/2};
	layout.on[obj_btn_dec_y.id] = {x: layout.on[obj_container.id].x + obj_container.width/2 + obj_btn_dec_y.width/2,
		y:layout.on[obj_container.id].y + obj_btn_dec_y.height/2};
	layout.on[obj_btn_inc_x.id] = {x: layout.on[obj_container.id].x + obj_btn_inc_x.width/2,
		y:layout.on[obj_container.id].y + obj_container.height/2 + obj_btn_inc_x.height/2};
	layout.on[obj_btn_dec_x.id] = {x: layout.on[obj_container.id].x - obj_btn_dec_x.width/2,
		y:layout.on[obj_container.id].y + obj_container.height/2 + obj_btn_dec_x.height/2};

	layout.on[obj_btn_game_start.id] = {x: layout.on[obj_panel.id].x + obj_panel.width/2 - obj_btn_game_start.width/2,
		y: layout.on[obj_panel.id].y + obj_panel.height/2 - obj_btn_game_start.height/2};

	layout.on[obj_btn_search.id] = {
		x:layout.on[obj_panel.id].x + obj_panel.width/2 - obj_btn_search.width/ 1.5,
		y: layout.on[obj_btn_game_start.id].y - obj_btn_search.height * 1.2};
	layout.on[obj_panel_search.id] = {
		x: layout.on[obj_panel.id].x - obj_panel.width/2 - obj_panel_search.width/2 - 10,
		y: cfg.height * 0.4
	};

	for (i = 0; i < 4; i++) 
	{
		layout.on[obj_images_search[i].id] = {
			x: layout.on[obj_panel_search.id].x,
			y: layout.on[obj_panel_search.id].y - obj_panel_search.height / 2 + (i + 0.5) * obj_panel_search.height / 4 
		}
	}

	var obj;
	var flag = false;
	for (i in list_objects) {
		obj = list_objects[i];
		if (obj === obj_bkg) continue;
		if (obj === obj_mask) continue;
		if (flag === false) layout.off[obj.id] = {x: layout.on[obj.id].x + obj_sidebar.width * 1.5, y: layout.on[obj.id].y};
		else {
			layout.off[obj.id] = {x: layout.on[obj.id].x, y: layout.on[obj.id].y - layout.on[obj_panel.id].y - obj_panel.height/2};
		}
		if (obj === obj_btn_back) flag = true;
	}

	resume();
	menu.Initialize();
	menu.Run();
}

function before_init() {
	canvas = document.getElementById("content");
	video = document.createElement('video');

	img_bkg= new Image();
	img_btn = new Image();
	img_mask = new Image();
	img_sidebar = new Image();
	img_panel = new Image();
	img_nav = new Image();
	img_grid_adj = new Image();
	img_game_start = new Image();

	img_bkg.src = "./img/background3.png";
	img_btn.src = "./img/button3.png";
	img_mask.src = "./img/mask.png";
	img_sidebar.src = "./img/sidebar.png";
	img_panel.src = "./img/panel.png";
	img_nav.src = "./img/nav.png";
	img_grid_adj.src = "./img/grid_adj.png";
	img_game_start.src = "./img/game_start.png";

	img_bkg.onload = function(){ resource_loaded();};
	img_btn.onload = function(){ resource_loaded(); };
	img_mask.onload = function(){ resource_loaded(); };
	img_sidebar.onload = function(){ resource_loaded(); };
	img_panel.onload = function(){ resource_loaded(); };
	img_nav.onload = function(){resource_loaded(); };
	img_grid_adj.onload = function(){resource_loaded(); };
	img_game_start.onload = function(){ resource_loaded(); };
}

function resource_loaded(){
	++cnt_img_loaded;
	if (cnt_img_loaded === cnt_img) menu_init();
}

function assign() {
	//	define the main module
	list_objects = [obj_bkg, 
				 obj_sidebar, obj_btn_start, obj_btn_opt, 
				 obj_btn_slide, obj_btn_switch, obj_btn_drag, obj_btn_back,
				 obj_mask, 
				 obj_panel, obj_frame, obj_container,
				 obj_btn_prevpuz, obj_btn_nextpuz,
				 obj_btn_inc_x, obj_btn_dec_x, obj_btn_inc_y, obj_btn_dec_y,
				 obj_btn_game_start, obj_btn_search, obj_panel_search,
				 obj_images_search[0], obj_images_search[1], obj_images_search[2], obj_images_search[3] 
			];

	sidebar_main = {
		id: 1,
		cnt_obj: 3,
		cnt_completed: 0,
		folded: true,
		event_registered: false,
		list_obj: [obj_sidebar, obj_btn_start, obj_btn_opt]
	};
	sidebar_sub = {
		id: 2,
		cnt_obj: 5,
		cnt_completed: 0,
		folded: true,
		event_registered: false,
		list_obj: [obj_sidebar, obj_btn_slide, obj_btn_switch, obj_btn_drag, obj_btn_back]
	};
	panel_main = {
		id: 1,
		cnt_obj: 11,
		cnt_completed: 0,
		folded: true,
		event_registered: false,
		list_obj: [obj_panel, obj_frame, obj_container, 
		obj_btn_prevpuz, obj_btn_nextpuz, 
		obj_btn_inc_x, obj_btn_dec_x, obj_btn_inc_y, obj_btn_dec_y,
		obj_btn_game_start, obj_btn_search]
	};
	panel_search = {
		id: 2,
		cnt_obj: 1,
		cnt_completed: 0,
		folded: true,
		event_registered: false,
		list_obj: [obj_panel_search, obj_images_search[0], obj_images_search[1], obj_images_search[2], obj_images_search[3]]
	}
}

function resume() {
	place();
	
	menu.__addEventListener("onmousedown", function(){
		var obj = new Jigsaw.object.Circle({
			radius: 20,
			life: 30,
			fill_color: "rgba(255,255,255,0)"
		});

		menu.addObj(obj, menu.mousePos.x, menu.mousePos.y);
		obj.events.receive = false;
		obj.bind_shape(120, 1200);
		obj.mount_func(function(){
			var radgrad = menu.ctx.createRadialGradient(
				0, 0, 0.0,
				0, 0, obj.radius);
			radgrad.addColorStop(0, 'rgba(255,255,255,0)');
			radgrad.addColorStop(1, 'rgba(255,255,255,0.2)');
			obj.fill_color = radgrad;
		},null);
	});
	
	grid_paint = {
		next: null,
		prev: null,
		scene: null,
		lightarea: 0,
		cnt: 0,
		inlink: false,
		end: false,
		f: function(){
			menu.isContentChanged = true;
			var ctx = menu.ctx;
			var tmpfs = ctx.fillStyle;
			var w = obj_container.width / puz_col, h = obj_container.height / puz_row;
			var x0 = obj_container.x - obj_container.width/2;
			var y0 = obj_container.y - obj_container.height/2;
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			for (var i = 0; i < puz_row; i++)
				for (var j = 0; j < puz_col; j++)
				{
					if (this.lightarea == i * puz_col + j) continue;
					ctx.fillRect(x0+j*w, y0+i*h, w, h);
				}
			ctx.fillStyle = tmpfs;
			++this.cnt;
			if (this.cnt == 5) {
				++this.lightarea;
				this.cnt = 0;
			}
			if (this.lightarea == puz_col * puz_row) this.lightarea = 0;
		}
	};

	if (current_sidebar_id === 1) {
		if (sidebar_main.event_registered === false) register_sidebar_main();
		unfold(sidebar_main);
	}
	else if (current_sidebar_id === 2) {
		register_sidebar_sub();
		unfold(sidebar_sub);
	}
	else alert("wrong id of sidebar!");
}

function place(){
	var obj;
	for (var i in list_objects) {
		obj = list_objects[i];
		obj.events.receive = false;
		obj.setPos(layout.off[obj.id].x, layout.off[obj.id].y);
	}
}

function isActionComplete(item, f){
	++item.cnt_completed;
	if (item.cnt_completed === item.cnt_obj) {
		item.cnt_completed = 0;
		f();
	}
}

function fold(item, f) {
	var obj;
	var time = 200;
	item.cnt_completed = 0;
	item.folded = true;
	if (item === panel_main) grid_paint.end = function(){return true;};
	event_receive_off(item);
	if (f === undefined) {
		for (var i in item.list_obj) 
		{
			obj = item.list_obj[i];
			obj.bind_motion(layout.off[obj.id].x, layout.off[obj.id].y, time);
		}
	}
	else {
		for (var i in item.list_obj) 
		{
			obj = item.list_obj[i];
			obj.bind_motion(layout.off[obj.id].x, layout.off[obj.id].y, time, 
					function(){isActionComplete(item, f);});
		}
	}
}

function unfold(item, f) {
	var obj;
	var time = 400;
	item.folded = false;
	item.cnt_completed = 0;
	if (item === panel_main) {
		grid_paint.end = null;
		grid_paint.scene = menu;
		menu.insert(grid_paint, obj_container.next);
	}
	if (item.id !== undefined && item.id !== null) {
		if (item === sidebar_main || item === sidebar_sub) current_sidebar_id = item.id;
	}
	event_receive_on(item);
	if (f === undefined) {
		for (var i in item.list_obj) {
			obj = item.list_obj[i];
			obj.bind_motion(layout.on[obj.id].x, layout.on[obj.id].y, time);
		}
	}
	else {
		for (var i in item.list_obj) {
			obj = item.list_obj[i];
			obj.bind_motion(layout.on[obj.id].x, layout.on[obj.id].y, time,
					function(){isActionComplete(item, f);});
		}
	}
}

function event_receive_on(item) {
	for (var i in item.list_obj) {
		item.list_obj[i].events.receive = true;
	}
}

function event_receive_off(item) {
	for (var i in item.list_obj) {
		item.list_obj[i].events.receive = false;
	}
}

function previous_layer(){
	game_mode = 0;
	if (panel_main.folded == false) {
		fold(panel_search);
		fold(panel_main, function(){fold(sidebar_sub, function(){unfold(sidebar_main);});});
	}
	else {
		fold(sidebar_sub, function(){unfold(sidebar_main);});
	}
}

function register_panel_main() {
	if (panel_main.event_registered === false) {
		register_panel_button();
		obj_btn_nextpuz.addEventListener("mouseup", function(){
			if (current_puzzle_id < max_puzzle_id) load_puz(current_puzzle_id+1);
		});
		obj_btn_prevpuz.addEventListener("mouseup", function(){
			if (current_puzzle_id > 0) load_puz(current_puzzle_id-1);
		});
		obj_btn_inc_x.addEventListener("mouseup", function(){
			if (puz_col < max_col) {
				menu.isContentChanged = true;
				++puz_col;
				grid_paint.lightarea = 0;
				if (puz_col == min_col + 1) obj_btn_dec_x.sy = 0;
				if (puz_col == max_col) obj_btn_inc_x.sy = img_grid_adj.height*2/3;
			}
		});
		obj_btn_dec_x.addEventListener("mouseup", function(){
			if (puz_col > min_col) {
				menu.isContentChanged = true;
				--puz_col;
				grid_paint.lightarea = 0;
				if (puz_col == max_col - 1) obj_btn_inc_x.sy = 0;
				if (puz_col == min_col) obj_btn_dec_x.sy = img_grid_adj.height*2/3;
			}
		});
		obj_btn_inc_y.addEventListener("mouseup", function(){
			if (puz_row < max_row) {
				menu.isContentChanged = true;
				++puz_row;
				grid_paint.lightarea = 0;
				if (puz_row == min_row + 1) obj_btn_dec_y.sy = 0;
				if (puz_row == max_row) obj_btn_inc_y.sy = img_grid_adj.height*2/3;
			}
		});
		obj_btn_dec_y.addEventListener("mouseup", function(){
			if (puz_row > min_row) {
				menu.isContentChanged = true;
				--puz_row;
				grid_paint.lightarea = 0;
				if (puz_row == max_row - 1) obj_btn_inc_y.sy = 0;
				if (puz_row == min_row) obj_btn_dec_y.sy = img_grid_adj.height*2/3;
			}
		});
		obj_btn_search.addEventListener("mousein", function(){
			obj_btn_search.stroke_color = "rgb(255, 20, 0)";
			obj_btn_search.fill_color = null;
		});
		obj_btn_search.addEventListener("mouseout", function(){
			obj_btn_search.stroke_color = null;
			obj_btn_search.fill_color = "rgb(255,255,255)";
		});
		obj_btn_search.addEventListener("mouseup", function(){
				var sFeatures = "cneter:yes,diaglogHeight:100px, dialogWidth:100px, edge: sunken,status:no";
				var keyword = window.showModalDialog("search.html", "", sFeatures);
				if (keyword !== undefined && keyword !== null) {
					for (i = 0; i < 4; i++)
						obj_images_search[i].image = null;
					unfold(panel_search);
					Google_Image_Search(keyword);
				}
		});

		obj_btn_game_start.addEventListener("mousein", function(){
			obj_btn_game_start.stroke_color = "rgb(255, 20, 0)";
			obj_btn_game_start.fill_color = null;
		});
		obj_btn_game_start.addEventListener("mouseout", function(){
			obj_btn_game_start.fill_color = "rgb(255,255,255)";
			obj_btn_game_start.stroke_color = null; 
		});
		obj_btn_game_start.addEventListener("mouseup", function(){
			fold(panel_main, function(){
				fold(sidebar_sub, function(){
					obj_btn_game_start.fill_color = "rgb(255,255,255)";
					obj_btn_game_start.stroke_color = null; 
					game_fps = 40;
					menu.exit();
					menu = null;
					game_start();
				});
			});
		});
		obj_container.addEventListener("drop", function(e){
			console.log('dropped');
			var dt = e.dataTransfer;	
			var files = dt.files;
			e.preventDefault();
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				if (handleFile(file, img_puz, obj_container)){

					img_puz.onload = function(){
						menu.isContentChanged = true;
						obj_container.image = img_puz;
						obj_container.sx = 0;
						obj_container.sy = 0;
						obj_container.orgw = img_puz.width;
						obj_container.orgh = img_puz.height;

						if (img_puz.height/img_puz.width <= (obj_frame.height-1)/(obj_frame.width-1)) {
							obj_container.width = (obj_frame.width - 1);
							obj_container.height = (obj_frame.width-1) * img_puz.height/img_puz.width;
						}
						else {
							obj_container.height = obj_frame.height - 1;
							obj_container.width = (obj_frame.height - 1) * img_puz.width / img_puz.height;
						}
					}
				}
			}
		});

	}
	panel_main.event_registered = true;
}

function register_sidebar_main() {
	if (sidebar_main.event_registered === false) {
		register_sidebar_button(obj_btn_start);
		register_sidebar_button(obj_btn_opt);
		obj_btn_start.addEventListener("mouseup", function(){
			if (sidebar_sub.event_registered === false) register_sidebar_sub();
			fold(sidebar_main, function(){
				unfold(sidebar_sub);
			});
		});
	}
	sidebar_main.event_registered = true;
}

function register_sidebar_sub() {
	if (sidebar_sub.event_registered === false)  {
		register_sidebar_button(obj_btn_slide);
		register_sidebar_button(obj_btn_switch);
		register_sidebar_button(obj_btn_drag);
		register_sidebar_button(obj_btn_back);
		obj_btn_back.addEventListener("mouseup", function(){
			if (sidebar_main.event_registered === false) register_sidebar_main();
			previous_layer();
		});
		obj_btn_slide.addEventListener("mouseup", function(){
			game_mode = 2;
			register_sidebar_sub_button();
			load_puz(current_puzzle_id);
		});
		obj_btn_switch.addEventListener("mouseup", function(){
			game_mode = 1;
			register_sidebar_sub_button();
			load_puz(current_puzzle_id);
		});
		obj_btn_drag.addEventListener("mouseup", function(){
			game_mode = 3;
			register_sidebar_sub_button();
			load_puz(current_puzzle_id);
		});
	}
	sidebar_sub.event_registered = true;
}

function register_panel_button() {
	obj_btn_prevpuz.addEventListener("mousein", function(){
		menu.isContentChanged = true;
		obj_btn_prevpuz.sy = img_nav.height/2;
	});
	obj_btn_prevpuz.addEventListener("mouseout", function(){
		menu.isContentChanged = true;
		obj_btn_prevpuz.sy = 0;
	});

	obj_btn_nextpuz.addEventListener("mousein", function(){
		menu.isContentChanged = true;
		obj_btn_nextpuz.sy = img_nav.height/2;
	});
	obj_btn_nextpuz.addEventListener("mouseout", function(){
		menu.isContentChanged = true;
		obj_btn_nextpuz.sy = 0;
	});
	obj_btn_inc_x.addEventListener("mousein", function(){
		if (puz_col < max_col) {
			menu.isContentChanged = true;
			obj_btn_inc_x.sy = img_grid_adj.height/3;
		}
	});
	obj_btn_inc_x.addEventListener("mouseout", function(){
		if (puz_col < max_col) {
			menu.isContentChanged = true;
			obj_btn_inc_x.sy = 0;
		}
	});

	obj_btn_dec_x.addEventListener("mousein", function(){
		if (puz_col > min_col) {
			menu.isContentChanged = true;
			obj_btn_dec_x.sy = img_grid_adj.height/3;
		}
	});

	obj_btn_dec_x.addEventListener("mouseout", function(){
		if (puz_col > min_col) {
			menu.isContentChanged = true;
			obj_btn_dec_x.sy = 0;
		}
	});

	obj_btn_inc_y.addEventListener("mousein", function(){
		if (puz_row < max_row) {
			menu.isContentChanged = true;
			obj_btn_inc_y.sy = img_grid_adj.height/3;
		}
	});
	obj_btn_inc_y.addEventListener("mouseout", function(){
		if (puz_row < max_row) {
			menu.isContentChanged = true;
			obj_btn_inc_y.sy = 0;
		}
	});

	obj_btn_dec_y.addEventListener("mousein", function(){
		if (puz_row > min_row) {
			menu.isContentChanged = true;
			obj_btn_dec_y.sy = img_grid_adj.height/3;
		}
	});
	obj_btn_dec_y.addEventListener("mouseout", function(){
		if (puz_row > min_row) {
			menu.isContentChanged = true;
			obj_btn_dec_y.sy = 0;
		}
	});
}

function register_sidebar_sub_button(){
	if (panel_main.event_registered === false) register_panel_main();
	if (panel_main.folded === true) unfold(panel_main)
	else {
		fold(panel_main, function(){
			unfold(panel_main);
		});
	}
}

function register_sidebar_button(obj) {
	var offset = 20;
	var time_in = 150;
	var time_out = 200;
	obj.addEventListener("mousein", function(){
		obj.bind_motion(layout.on[obj.id].x + offset, layout.on[obj.id].y, time_in);
		obj.mount_sfx(
			function(){
				var pos = menu.mousePos;
				var radgrad = menu.ctx.createLinearGradient(
					 - obj.width/2, 
					 - obj.height/2,
					obj.width/2, 
					obj.height/2
					);
				radgrad.addColorStop(0, 'rgba(255,255,255,1)');
				radgrad.addColorStop(1, 'rgba(255,255,255,0)');

				menu.ctx.fillStyle = radgrad;
				menu.ctx.fillRect(-obj.width/2, 
					-obj.height/2,
					obj.width, obj.height
					);
			}, 
			function(){ if (!obj.status.mouseover) return true;}
		);
	});
	obj.addEventListener("mouseout", function(){
		obj.bind_motion(layout.on[obj.id].x, layout.on[obj.id].y, time_out);
	});
}

function load_puz(i) {
	if (i == current_puzzle_id && image_loaded) return false;
	if (i !== current_puzzle_id) image_loaded = false;
	current_puzzle_id = i;
	var src = "./img/puzzle/puz_" + i + ".jpg";
	img_puz.src = src;
	obj_container.image = null;
	img_puz.onload = function(){
		image_loaded = true;
		menu.isContentChanged = true;
		obj_container.image = img_puz;
		obj_container.sx = 0;
		obj_container.sy = 0;
		obj_container.orgw = img_puz.width;
		obj_container.orgh = img_puz.height;

		if (img_puz.height/img_puz.width <= (obj_frame.height-1)/(obj_frame.width-1)) {
			obj_container.width = (obj_frame.width - 1);
			obj_container.height = (obj_frame.width-1) * img_puz.height/img_puz.width;
		}
		else {
			obj_container.height = obj_frame.height-1;
			obj_container.width = (obj_frame.height - 1) * img_puz.width / img_puz.height;
		}
	}
}

function game_start() {
	var img;
	if (game_mode == 0) return false;

	if (game_mode == 1 && current_puzzle_id == 5)
	{
		_width = 1280;
		_height = 720;
	}
	else {
		img = obj_container.image;
		_width = img.width;
		_height = img.height;
	}
	var w, h, x, y;
	var w_ratio = 0.68, h_ratio = 0.88;
	var x_ratio = 0.38, y_ratio = 0.48;

	if (_height <= cfg.height * h_ratio && _width <= cfg.width * w_ratio) {
		w = _width;
		h = _height;
		x = cfg.width * x_ratio - w/2;
		y = cfg.height * y_ratio - h/2;
	}
	else {
		if (_height / _width <= cfg.height*h_ratio / cfg.width/w_ratio) {
			w = cfg.width * w_ratio;
			h = w * _height / _width;
			x = cfg.width * x_ratio - w / 2;
			y = cfg.height * y_ratio - h / 2;
		}
		else {
			h = cfg.height * h_ratio;
			w = h * _width/_height;
			x = cfg.width * x_ratio - w / 2;
			y = cfg.height * y_ratio - h / 2;
		}
	}
	if (game_mode == 1) {
		if (current_puzzle_id == 5) {
			if (!video_loaded) {
				video.width = _width;
				video.height = _height;
				video.src = "./video/demo_transcoded.mp4";
				video.addEventListener('canplaythrough', function(){
					video_loaded = true;
					game = new Jigsaw.game.Switch({
						canvas: canvas,
						 image: video,
						 seg: {row: puz_row, col: puz_col},
						 game_area: {x: x, y: y , w: w, h: h},
						 control_area: {x:cfg.width*3/4, y: 0, w: cfg.width* 1/4, h: cfg.height},
						 video: true,
						 fps: game_fps
					});
					game.GameStart();
				}, false);
			}
			else {
				video.currentTime = 0;
				game = new Jigsaw.game.Switch({
					canvas: canvas,
					image: video,
					seg: {row: puz_row, col: puz_col},
					game_area: {x: x, y: y , w: w, h: h},
					 control_area: {x:cfg.width*3/4, y: 0, w: cfg.width* 1/4, h: cfg.height},
					 video: true,
					fps: game_fps
				});
				game.GameStart();
			}
		}
		else {
			game = new Jigsaw.game.Switch({
				canvas: canvas,
				image: img,
				seg: {row: puz_row, col: puz_col},
				game_area: {x: x, y: y , w: w, h: h},
				control_area: {x:cfg.width*3/4, y: 0, w: cfg.width* 1/4, h: cfg.height},
				fps: game_fps
			});
			game.GameStart();
		}
	}
	else if (game_mode == 2) {
		game = new Jigsaw.game.Slide({
			canvas: canvas,
			image: img,
			seg: {row: puz_row, col: puz_col},
			game_area: {x: x, y:y, w:w, h: h},
			control_area: {x:cfg.width*3/4, y: 0, w: cfg.width* 1/4, h: cfg.height},
			fps: game_fps
		});
		game.GameStart();
	}
	else if (game_mode == 3){
		game = new Jigsaw.game.Drag({
			canvas: canvas,
			randomE: true,
			image: img,
			seg: {row: puz_row, col: puz_col},
			game_area: {x: x, y:y, w:w, h: h},
			control_area: {x:cfg.width*3/4, y: 0, w: cfg.width* 1/4, h: cfg.height},
			fps: game_fps
		});
		game.GameStart();
	}
}

function Google_Image_Search(keyword) {
	getJSONP("http://ajax.googleapis.com/ajax/services/search/images?v=1.0&rsz=4&q="+keyword, "JSONP_loader");
}


function JSONP_loader(data)
{
	var images = [];
	for (var i = 0; i < 4; i++)
	{
		obj = data.responseData.results[i];
		images[i] = new Image();
		images[i].src = obj.url;
		images[i].onload = function(k){
			return function(){
				obj_images_search[k].image = images[k];
				obj_images_search[k].sx = 0;
				obj_images_search[k].sy = 0;

				obj_images_search[k].orgw = images[k].width;
				obj_images_search[k].orgh = images[k].height;
				_height = images[k].height;
				_width = images[k].width;
				if (_height <= obj_panel_search.height / 4.2 && _width <= obj_panel_search.width) {
					w = _width;
					h = _height;
				}
				else {
					if (_height / _width <= obj_panel_search.height / 4.2 /obj_panel_search.width) {
						w = obj_panel_search.width;
						h = w * _height / _width;
					}
					else {
						h = obj_panel_search.height / 4.2; 
						w = h * _width/_height;
					}
				}
				obj_images_search[k].addEventListener("mousedown", function(){
					obj_container.image = obj_images_search[k].image;
					obj_container.orgw = obj_container.image.width;
					obj_container.orgh = obj_container.image.height;
					obj_container.sx = 0;
					obj_container.sy = 0;
					if (obj_container.orgh / obj_container.orgw<= (obj_frame.height-1)/(obj_frame.width-1)) {
							obj_container.width = obj_frame.width - 1;
							obj_container.height = (obj_frame.width-1) * obj_container.orgh/obj_container.orgw;
						}
						else {
							obj_container.height = obj_frame.height - 1;
							obj_container.width = (obj_frame.height - 1) * obj_container.orgw / obj_container.orgh;
						}
				});
				obj_images_search[k].width = w;
				obj_images_search[k].height = h;
				obj_images_search[k].x = obj_panel_search.x;
			};
		}(i);
	}
	var t = document.getElementById('temp');
	t.parentNode.removeChild(t);
}
