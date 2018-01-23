function Face(name){
    this.name = name;
    this.edge = null;
    this.centroid = null;
}

Face.prototype.makeCentroid = function(){
    var e = this.edge.next;
    var i,xSum,ySum = 0;
    while(e.name != this.edge.name){
        i++;
        xSum += e.origin.x;
        ySum += e.origin.y;
        e = e.next;
    }
    this.centroid = new Point(xSum/i, ySum/i, this.name+"center");
};
Face.prototype.setEdge = function(e){
    this.edge = e;
    this.makeCentroid();
};
Face.prototype.getCenter = function(){
    return this.centroid;
};
Face.prototype.getName = function(){
    return "face"+this.name;
};