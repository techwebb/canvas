function Point(x, y, name){
	this.name = name;
	this.x = x;
	this.y = y;
	this.edge = null;
}

Point.prototype.distance = function(point){
   return(Math.sqrt( this.distance2(point) ));
};

Point.prototype.distance2 = function(point){
   return(sqr(point.x-this.x) + sqr(point.y-this.y));
};

Point.prototype.setEdge = function(e){
	this.edge = e;
};

Point.prototype.toHTML = function(){
	let edge = this.edge ? "<br/>"+this.edge.getName() : ''
	return `<b>p${this.name}</b><br/>(${this.x}, ${this.y})${edge}`;
};

Point.prototype.toJSON = function(){
	return JSON.stringify({
		name: "p"+this.name,
		x: this.x,
		y: this.y
	});
	var string = `{"name":"p${this.name}", "x":${this.x}, "y":${this.y}}`;
	return JSON.parse(string);
};
Point.prototype.getName = function(){
	return "p"+this.name;
};
Point.prototype.moveTo = function(destination){
	this.x = destination.x;
	this.y = destination.y;
}

function sqr(x){
	return x*x;
}
