function Triangulation(points){

	this.poly = new Poly();
	//this.poly.makeFromPointArray(points);
	
	this.edges = [];
	this.points = [];
	this.Tree = [];
	this.addDiagonals = [];
}





Triangulation.prototype.makeMonotone = function(){

	var points = this.poly.getPoints();
	this.Tree = [];
	this.addDiagonals = [];

	//need to clear out edges that were added before
	this.poly = new Poly();
	this.poly.makeFromPointArray(points);

	var edges = this.poly.getEdges();
	points = points.sort(function(a,b){
		if(a.y==b.y)
			return (a.x - b.x);
		else
			return (a.y - b.y);
	});
	//big main loop. 
	console.log("big loop: ", points)
	for(var i=0; i < points.length; i++){
		var type = this.determinePointType(points[i]);
		console.log(i, type, points[i].name, this.treeToString());
		switch(type){
			case "startVertex":
				this.startVertex(points[i]);
				break;
			case "endVertex":
				this.endVertex(points[i]);
				break;
			case "splitVertex":
				this.splitVertex(points[i]);
				break;
			case "regularVertex":
				this.regularVertex(points[i]);
				break;
			case "mergeVertex":
				this.mergeVertex(points[i]);
				break;
		}
	}
	this.addDiagonals.forEach((item) => this.poly.addDiagonal(item[0], item[1]));
};


Triangulation.prototype.getEdges = function(){
	return this.poly.getEdges();
};
Triangulation.prototype.getPoints = function(){
	return this.poly.getPoints();
};
Triangulation.prototype.getPoly = function(){
	return this.poly;
};

Triangulation.prototype.determinePointType = function(p){
	var left = p.edge.next.origin;
	var right = p.edge.prev.origin;
	if(this.isLower(p, left) && this.isLower(p, right)){
		if(this.isCCW(left, p, right)){
			return "startVertex"
		}else{
			return "splitVertex";	
		}
	}
	else if(this.isLower(left, p) && this.isLower(right, p)){
		if(this.isCCW(left, p, right)){
			return "endVertex";
		}else{
			return "mergeVertex";	
		}
	}
	else{
		return "regularVertex";
	}
};
Triangulation.prototype.startVertex = function(p){
	this.Tree.push(p.edge);
	p.edge.setHelper(p);
};
Triangulation.prototype.endVertex = function(p){
	if(this.determinePointType(p.edge.prev.helper) == 'mergeVertex'){
		this.addDiagonals.push([p, p.edge.prev.helper]);
	}
	this.Tree.splice(this.treeIndexOfEdge(p.edge.prev), 1);
};
Triangulation.prototype.splitVertex = function(p){
	var edgeToTheLeft = this.getEdgeToLeft(p);
	this.addDiagonals.push([p, edgeToTheLeft.helper]);
	edgeToTheLeft.setHelper(p);
	this.Tree.push(p.edge);
	p.edge.setHelper(p);
};

Triangulation.prototype.mergeVertex = function(p){
	let toSplice = p.edge.prev;
	if(this.determinePointType(p.edge.prev.helper) == 'mergeVertex'){
		this.addDiagonals.push([p, p.edge.prev.helper]);
	}
	this.Tree.splice(this.treeIndexOfEdge(toSplice), 1);
	let edgeToTheLeft = this.getEdgeToLeft(p);
	if(this.determinePointType(edgeToTheLeft.helper) == 'mergeVertex'){
		this.addDiagonals.push([p, edgeToTheLeft.helper]);
	}
	edgeToTheLeft.setHelper(p);
};
Triangulation.prototype.regularVertex = function(p){
	if(p.edge.next.origin.y > p.y || (p.edge.next.origin.y == p.y && p.edge.next.origin.x > p.x)){
		if(this.determinePointType(p.edge.prev.helper) == 'mergeVertex'){
			this.addDiagonals.push([p, p.edge.prev.helper]);
		}
		this.Tree.splice(this.treeIndexOfEdge(p.edge.prev), 1);
		this.Tree.push(p.edge);
		p.edge.setHelper(p);
	}else{ 
		var edgeToTheLeft = this.getEdgeToLeft(p);
		if(this.determinePointType(edgeToTheLeft.helper) == 'mergeVertex'){
			this.addDiagonals.push([p, edgeToTheLeft.helper]);
		}
		edgeToTheLeft.setHelper(p);
	}
};

Triangulation.prototype.getHelperVertex = function(p){
	return this.getEdgeToLeft(p).helper;
};

Triangulation.prototype.treeIndexOfEdge = function(e){
	return this.Tree.indexOf(e);
	for(var i=0; i<this.Tree.length; i++){
		if(this.Tree[i].origin == e.origin) return i;
	}
	return -1;
};
Triangulation.prototype.getEdgeToLeft = function(p){

	if(this.Tree.length == 1) return this.Tree[0];
	//instead sort and filter this tree, and find the best match instead of the first success
	let sorted = this.Tree.filter((item) => this.isLower(item.origin, p) && (item.origin.x < p.x || item.next.origin.x < p.x) );
	sorted = sorted.map(function(item){
		return {
			x:(item.next.origin.x - item.origin.x) * ((p.y - item.origin.y) / (item.next.origin.y - item.origin.y)) + item.origin.x,
			e:item
	}
	}).sort((a,b) => a.x < b.x);
	return sorted[0].e;
};
Triangulation.prototype.treeToString = function(){
	var r = '';
	for(var i=0; i<this.Tree.length; i++){
		r += this.Tree[i].name+":"+this.Tree[i].helper.name+", ";
	}
	return r;
};

Triangulation.prototype.isLower = function(i, j){
	if(i.y < j.y || (i.y == j.y && i.x < j.x))
		return true;
	else
		return false;
};

Triangulation.prototype.isCCW = function(i, j, k){
	var det = ((j.x-i.x)*(k.y-i.y) - (j.y-i.y)*(k.x-i.x));
	return (det >= 0);
};

