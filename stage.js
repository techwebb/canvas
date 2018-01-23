function Stage(c){
    this.c = c;
}
Stage.prototype.init = function(color, width, height){
    this.c.fillStyle = color;
    this.c.fillRect (0, 0, width, height);
    this.c.width = width;
    this.c.height = height;
}

Stage.prototype.clear = function(){
    this.c.fillStyle = "#ffffff";
    this.c.fillRect (0, 0, w, h);
}

Stage.prototype.drawPoint = function(p, width=5, color="red"){
    this.c.fillStyle = color;
    this.c.beginPath();
    this.c.arc(p.x, p.y, width, 0, Math.PI*2, true);
    this.c.closePath();
    this.c.fill();
}

Stage.prototype.drawEdge = function(edge, width=4, color="black"){
    if(edge.next == null || edge.next.origin == null || edge.origin == null) return false;
    this.drawLine(edge.origin, edge.next.origin, width, color);
}

Stage.prototype.drawLine = function(a, b, width=4, color="grey"){
    this.c.lineWidth = width;
    this.c.strokeStyle = color;
    this.c.beginPath();
    this.c.moveTo(a.x, a.y);
    this.c.lineTo(b.x, b.y);
    this.c.closePath();
    this.c.stroke();
}

Stage.prototype.drawEdgeLoop = function(start, color="rgba(100,100,255,0.2)"){ //start is an edge
    this.c.fillStyle = color;
    this.c.beginPath();
    this.c.moveTo(start.origin.x, start.origin.y);
    var next = start.next;
    while(next.name != start.name){
        this.c.lineTo(next.origin.x, next.origin.y);
        var next = next.next;
    }
    this.c.lineTo(start.origin.x, start.origin.y);
    this.c.closePath();
    this.c.fill();
}