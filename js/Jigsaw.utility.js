function min(x, y) {
	return x < y ? x : y;
}

function max(x,y) {
	return x > y ? x : y;
}

function product_cross(p1, p2) {
	return p1.x*p2.y-p2.x*p1.y;
}

function vector_sum(v1, v2) {
	return {x: v1.x+v2.x, y: v1.y + v2.y};
}

function vector_sub(v1, v2) {
	return {x: v1.x - v2.x, y: v1.y - v2.y};
}

function getRandom(dl, ul) {
	var x = Math.random();
	var val=Math.floor(Math.random()*(ul-dl)+dl);
	return val;
}

function matrix_rotate(vector, sine, cosine) {
	return {
		x: vector.x * cosine + vector.y * sine,
		y: vector.y * cosine - vector.x * sine
	};
}

function direction(pi, pj, pk) {
	var p1 = {x: pk.x - pi.x, y: pk.y - pi.y},
		p2 = {x: pj.x - pi.x, y: pj.y - pi.y};
	return product_cross(p1, p2);
}

function distance(p1, p2) {
	return Math.sqrt((p1.x - p2.x)*(p1.x - p2.x) + (p1.y -p2.y)*(p1.y - p2.y));
}

function isOnSegment(pi, pj, pk) {
	if ((min(pi.x, pj.x) <= pk.x && pk.x <= max(pi.x, pj.x))
			&&(min(pi.y, pj.y) <= pk.y && pk.y <= max(pi.y, pj.y))) return true;
	return false;
}

function lineSectionCross(p1, p2, p3, p4) {
	var d1 = direction(p1, p2, p3);
	var d2 = direction(p1, p2, p4);

	if (d1 == 0) return true;
	if (d2 == 0) return true;
	if (d1 < 0 && d2 > 0 || d1 > 0 && d2 < 0 ) return true;

	return false;
}

function sectionCross(p1, p2, p3, p4) {
	var d1 = direction(p3, p4, p1);
	var d2 = direction(p3, p4, p2);
	var d3 = direction(p1, p2, p3);
	var d4 = direction(p1, p2, p4);
	if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && 
			((d3 > 0 && d4 < 0) || (d3 < 0 && d4 >0))) return true;
	if (d1 == 0 && isOnSegment(p3, p4, p1)) return true;
	if (d2 == 0 && isOnSegment(p3, p4, p2)) return true;

	if (d3 == 0 && isOnSegment(p1, p2, p3)) return true;
	if (d4 == 0 && isOnSegment(p1, p2, p4)) return true;

	return false;
}

function getRect(obj) {
	var diag_l = Math.sqrt(obj.width * obj.width + obj.height * obj.height) / 2;

	var edge_angle = obj.angle / 180 * Math.PI;
	var diag_angle = edge_angle + Math.PI / 4;

	var diag_sin = Math.sin(diag_angle), diag_cos = Math.cos(diag_angle);
	var edge_sin = Math.sin(edge_angle), edge_cos = Math.cos(edge_angle);

	var x1 = obj.x - diag_l * diag_cos, y1 = obj.y - diag_l * diag_sin;
	var x2 = x1 + obj.width * edge_cos, y2 = y1 + obj.width * edge_sin;
	var x4 = x1 - obj.height * edge_sin, y4 = y1 + obj.height * edge_cos;
	var x3 = x4 + obj.width * edge_cos, y3 = y4 + obj.width * edge_sin;
	
	return {
		a: {x: x1, y: y1},
		b: {x: x2, y: y2},
		c: {x: x3, y: y3},
		d: {x: x4, y: y4}
	}
}

function RectCollide(Recta, Rectb) {
	if (this.sectionCross(Recta.a, Recta.b, Rectb.a, Rectb.b) ||
		this.sectionCross(Recta.a, Recta.b, Rectb.b, Rectb.c) ||
		this.sectionCross(Recta.a, Recta.b, Rectb.c, Rectb.d) ||
		this.sectionCross(Recta.a, Recta.b, Rectb.d, Rectb.a)) return 1;

	if 	(this.sectionCross(Recta.b, Recta.c, Rectb.a, Rectb.b) ||
		 this.sectionCross(Recta.b, Recta.c, Rectb.b, Rectb.c) ||
		 this.sectionCross(Recta.b, Recta.c, Rectb.c, Rectb.d) ||
		 this.sectionCross(Recta.b, Recta.c, Rectb.d, Rectb.a)) return 2;

	if 	(this.sectionCross(Recta.c, Recta.d, Rectb.a, Rectb.b) ||
		 this.sectionCross(Recta.c, Recta.d, Rectb.b, Rectb.c) ||
		 this.sectionCross(Recta.c, Recta.d, Rectb.c, Rectb.d) ||
		 this.sectionCross(Recta.c, Recta.d, Rectb.d, Rectb.a)) return 3;

	if	(this.sectionCross(Recta.d, Recta.a, Rectb.a, Rectb.b) ||
		 this.sectionCross(Recta.d, Recta.a, Rectb.b, Rectb.c) ||
		 this.sectionCross(Recta.d, Recta.a, Rectb.c, Rectb.d) ||
		 this.sectionCross(Recta.d, Recta.a, Rectb.d, Rectb.a)) return 4;
	return false;
}

function maybeCollide(obja, objb) {
	var dist = distance({x:obja.x, y:obja.y},{x:obja.x, y:obja.y});
	var diag = Math.sqrt(obja.width*obja.width + obja.height*obja.height) + 
					Math.sqrt(objb.width*objb.widht+objb.height*objb.height);
	if (2*dist > diag) return false;
	return true;
}

function pointInRect(point, Rect) {
	var point2 = vector_sum(point, vector_sub(Rect.b, Rect.a));
	var point3 = vector_sum(point, vector_sub(Rect.d, Rect.a));
	if (lineSectionCross(point, point2, Rect.a, Rect.d) && lineSectionCross(point, point3, Rect.a, Rect.b))
		return true;
	return false;
}

function handleFile(file, image, obj)
{
	var imageType = /image.*/;

	if(file.type.match(imageType)) {
		var reader = new FileReader();

		reader.onloadend = function() {
			if (obj !== undefined) obj.image = null;
			image.src = reader.result;
		}
		reader.readAsDataURL(file);
		return true;
	}
	return false;
}

function getJSONP(url, callback) {
	var script = document.createElement('script');
	script.id = "temp";
	script.src = url+"&callback="+callback;
	document.getElementsByTagName('head')[0].appendChild(script);
}

function JSON_loader(data)
{
	var t = document.getElementById('temp');
	t.parentNode.removeChild(t);
}
