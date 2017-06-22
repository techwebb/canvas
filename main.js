// The amount of symbol we want to place;
var count = 7;
var done = false;
var polyBase = new Poly();
var poly2 = null;
var dragPoint = null;
var dragEdge = null;

function mouseX(e){return e.clientX - e.target.offsetLeft;}
function mouseY(e){return e.clientY - e.target.offsetTop;}




function mouseDown(e){
    var x = mouseX(e);
    var y = mouseY(e);
    dragPoint = PointCollision(x,y);
    if(done){
        var polyEdges = poly2.getEdges();
        var startEdge = EdgeCollectionCollision(x, y, polyEdges);
        console.log(startEdge);
    }
    if(dragPoint){
        dragPoint.x = x;
        dragPoint.y = y;
        document.addEventListener('mouseup', mouseUp);
        redraw();
        return;
    }
    if(!done && polyBase.getPoints().length < count){ //add new point
        console.log(x,y,polyBase.getPoints().length);
        if(polyBase.getPoints().length == 0){
            polyBase.firstPoint(x,y);
        }else if(polyBase.getPoints().length == 1){
            var addedPoints = polyBase.getPoints();
            var lastEdge = addedPoints[addedPoints.length-1].edge;
            polyBase.secondPoint(x,y, lastEdge);
        }else{
            var addedPoints = polyBase.getPoints();
            var lastEdge = addedPoints[addedPoints.length-1].edge.twin;
            polyBase.thirdPoint(x,y, lastEdge);
        }
    }
    if(!done && polyBase.getPoints().length == count){
        done = true;
        var addedPoints = polyBase.getPoints();
        var lastEdge = addedPoints[addedPoints.length-1].edge.twin;
        var firstEdge = addedPoints[0].edge;
        polyBase.close(firstEdge, lastEdge);
    }
    redraw();
    if(done && startEdge && startEdge.polygon != null){
        //clearCanvas();
        drawEdgeLoop(startEdge);
    }
}
function mouseUp(){
    dragPoint = null;
    document.removeEventListener('mouseup', mouseUp);
}
function mouseMove(e){
    
    var x = mouseX(e);
    var y = mouseY(e);
    document.getElementById('xDisplay').innerHTML = x;
    document.getElementById('yDisplay').innerHTML = y;
    if(dragPoint)
        document.getElementById('dragDisplay').innerHTML = dragPoint.name;
    else document.getElementById('dragDisplay').innerHTML = 'null';

    if(dragPoint!=null){
        dragPoint.x = x;
        dragPoint.y = y;
        redraw();
    }

redraw();
    var pointByMouse = PointCollision(x,y);
    var lineByMouse = LineCollision(x,y, true);
    var div = document.getElementById('mouseHoverDisplay');
    if (!dragPoint && pointByMouse){
        div.innerHTML = pointByMouse.toHTML();
        div.style.visibility = "visible";
        div.style.top = Math.min(pointByMouse.y,y)-70+"px";
        div.style.left = pointByMouse.x-(div.offsetWidth/2)+"px"; 
    }else if(!dragPoint && lineByMouse){
        div.innerHTML = lineByMouse.toHTML();
        div.style.visibility = "visible";
        div.style.top = Math.min((lineByMouse.origin.y+lineByMouse.next.origin.y)/2,y-30)-50+"px";
        div.style.left = (lineByMouse.origin.x+lineByMouse.next.origin.x)/2-(div.offsetWidth/2)+"px"; 
        //drawNgon(lineByMouse);
    }else{
        div.innerHTML = "";
        div.style.visibility = "hidden";
    }
    
}
function clearCanvas(){
    c.fillStyle = "#ffffff";
    c.fillRect (0, 0, w, h);
}

function redraw(){
    clearCanvas();

    if(done){
        polyBase = assureCCW(polyBase);
        //console.log('running triangulation');
        var tri = new Triangulation(polyBase);
        tri.makeMonotone();
        poly2 = tri.getPoly();

        drawPoly(poly2, 3, '#f00');
        //drawPoly(polyBase, 1, '#666');

        if(dragEdge) fillPoly(dragEdge);
    }else{
        drawPoly(polyBase, 2, '#666');
    }
    //drawPoly(polyBase, 4, '#ccc');
}
function PointCollision(mouseX, mouseY){
    var points = /*done ? poly2.getPoints() :*/ polyBase.getPoints();
    for (i=0; i<points.length; i++){
        if(points[i].distance2(mouseX, mouseY) < 150) return points[i];
    }
    return null;
}
function LineCollision(mouseX, mouseY, debug = false){
    var p = new Point(mouseX, mouseY, 'mouse');
    var edges = done ? poly2.getEdges() : polyBase.getEdges();
    if(edges.length < 4) return null;
    return EdgeCollectionCollision(mouseX, mouseY, edges, debug);
}

function EdgeCollectionCollision(mouseX, mouseY, edges, debug=false){
    var p = new Point(mouseX, mouseY, 'mouse');
    if (debug) drawPoint(p, 'blue');
    for (var i=0; i<edges.length; i++){
        if(edges[i].next == null) continue;

        var v = edges[i].origin;
        var w = edges[i].next.origin;
        var t = Math.max(0, Math.min(1, (dot(p,v,w) / v.distance2(w.x, w.y)))); //normalized dot product of VP, WP
        var l = lerp(v,w,t);

        if (debug){
            drawLinePoints(p,v, 2, 'grey');
            drawLinePoints(p,w, 2, 'grey');
            drawPoint(l, 'green');
            drawLinePoints(l,p, 2, 'purple');
        }
        if ( p.distance(l.x,  l.y) < 15 && t < 0.5) //distance to lerp along VW using t
            return edges[i];
    }
    return null;
}

function drawPoly(polygon, width=3, color="black"){
    var points = polygon.getPoints();
    for(i=0; i<points.length; i++){
        drawPoint(points[i], 2*width, color);
    }
    if(points.length<2) return;

    var edges = polygon.getEdges();
    for(i=0; i<edges.length; i++){
        drawLine(edges[i], width, color);
    }
}
function drawPoint(p, width=5, color="red"){
    c.fillStyle = color;
    c.beginPath();
    c.arc(p.x, p.y, width, 0, Math.PI*2, true);
    c.closePath();
    c.fill();
}

function drawLine(edge, width=4, color="black"){
    if(edge.next == null || edge.next.origin == null || edge.origin == null) return false;
    drawLinePoints(edge.origin, edge.next.origin, width, color);
}
function drawLinePoints(a, b, width=2, color="grey"){
    c.lineWidth = width;
    c.strokeStyle = color;
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.closePath();
    c.stroke();
}
function drawEdgeLoop(start){ //start is an edge
    c.fillStyle = 'rgba(100,100,255,0.2)';
    c.beginPath();
    c.moveTo(start.origin.x, start.origin.y);
    //console.log(start);
    var next = start.next;
    //console.log("start: "+start.name);
    while(next.name != start.name){
        //console.log(count, next.name);
        c.lineTo(next.origin.x, next.origin.y);
        var next = next.next;
    }
    c.lineTo(start.origin.x, start.origin.y);
    c.closePath();
    c.fill();
}
function fillPoly(start){ // start is an edge

}

function dot(a, o, b){
    //vector 1 is OA
    //vector 2 is OB
    return (a.x - o.x) * (b.x - o.x) + (a.y - o.y) * (b.y - o.y);
}
function lerp(a,b,t){
    return new Point(a.x + t*(b.x-a.x), a.y+t*(b.y-a.y), 'lerp');
}
function assureCCW(polygon){
    var edges = polygon.getEdges();
    var sum = 0;
    for(var i=0; i<edges.length; i++){
        sum += (edges[i].next.origin.x - edges[i].origin.x)*(edges[i].next.origin.y + edges[i].origin.y);
    }
    if(sum >= 0) return polygon; //polygon is already CCW

    //points are CW, need to switch.
    console.log("reversing");
    var points = polygon.getPoints();
    polygon.wipe();
    for(var i=points.length; i--;){
        polygon.addPoint(points[i].x, points[i].y);
    }
    polygon.close();
    return polygon;
}