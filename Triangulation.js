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
		//console.log(i, this.treeToString());
		//if(i==5) break;
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
	//console.log(p);
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
		//this.poly.addDiagonal(p, p.edge.prev.helper);
	}
	this.Tree.splice(this.treeIndexOfEdge(p.edge.prev), 1);
};
Triangulation.prototype.splitVertex = function(p){
	var edgeToTheLeft = this.getEdgeToLeft(p);
	this.addDiagonals.push([p, edgeToTheLeft.helper]);
	//this.poly.addDiagonal(p, edgeToTheLeft.helper);
	edgeToTheLeft.setHelper(p);
	this.Tree.push(p.edge);
	p.edge.setHelper(p);
};

Triangulation.prototype.mergeVertex = function(p){
	let toSplice = p.edge.prev;
	//console.log(p.edge,"p.edge.prev.helper: "+this.determinePointType(p.edge.prev.helper));
	if(this.determinePointType(p.edge.prev.helper) == 'mergeVertex'){
		//console.log("bob");
		this.addDiagonals.push([p, p.edge.prev.helper]);
		//this.poly.addDiagonal(p, p.edge.prev.helper);
	}
	//console.log(this.treeIndexOfEdge(p.edge.prev));
	this.Tree.splice(this.treeIndexOfEdge(toSplice), 1);
	console.log("tree: "+this.treeToString());
	let edgeToTheLeft = this.getEdgeToLeft(p);
	console.log(edgeToTheLeft, "edgeToTheLeft.helper.name: "+edgeToTheLeft.helper.name, this.determinePointType(edgeToTheLeft.helper));
	if(this.determinePointType(edgeToTheLeft.helper) == 'mergeVertex'){
		//console.log()
		this.addDiagonals.push([p, edgeToTheLeft.helper]);
		//this.poly.addDiagonal(p, edgeToTheLeft.helper);
	}
	edgeToTheLeft.setHelper(p);
};
Triangulation.prototype.regularVertex = function(p){
	//polygon is to the right, edge is left side
	if(p.edge.next.origin.y > p.y || (p.edge.next.origin.y == p.y && p.edge.next.origin.x > p.x)){
		console.log("left");
		if(this.determinePointType(p.edge.prev.helper) == 'mergeVertex'){
			this.addDiagonals.push([p, p.edge.prev.helper]);
			//this.poly.addDiagonal(p, p.edge.prev.helper);
		}
		this.Tree.splice(this.treeIndexOfEdge(p.edge.prev), 1);
		this.Tree.push(p.edge);
		p.edge.setHelper(p);
	}else{ //edge on right side. polygon innards to the left
		console.log("right");
		var edgeToTheLeft = this.getEdgeToLeft(p);
		if(this.determinePointType(edgeToTheLeft.helper) == 'mergeVertex'){
			this.addDiagonals.push([p, edgeToTheLeft.helper]);
			//this.poly.addDiagonal(p, edgeToTheLeft.helper);
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
	//loop from the right side

	if(this.Tree.length == 1) return this.Tree[0];
	//instead sort and filter this tree, and find the best match instead of the first success
	let sorted = this.Tree.filter((item) => this.isLower(item.origin, p) && (item.origin.x < p.x || item.next.origin.x < p.x) );
	sorted = sorted.map(function(item){
		return {
			x:(item.next.origin.x - item.origin.x) * ((p.y - item.origin.y) / (item.next.origin.y - item.origin.y)) + item.origin.x,
			e:item
	}
	}).sort((a,b) => a.x < b.x);
	console.log(sorted);
	return sorted[0].e;
	// for(var i=this.Tree.length; i--;){
	// 	//origin is above point. origin is to the left of point
	// 	console.log(this.Tree[i].origin.y, p.y, this.Tree[i].origin.x, p.x)
	// 	if(this.isLower(this.Tree[i].origin, p) &&
	// 	 (this.Tree[i].origin.x < p.x || this.Tree[i].next.origin.x < p.x)){
	// 		//return the first success.
	// 		return this.Tree[i];
	// 	}
	// }
	console.log("died: "+p.name, this.treeToString(), this.Tree.length);
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

