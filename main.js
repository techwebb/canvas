// The amount of symbol we want to place;
var count = 7;
var done = false;
var debug = false; //shows helper lines for mouseMove
var polyBase = new Poly();
var additional = [];
var wip = [];
var poly2 = null;
var dragPoint = null;
var dragEdge = null;

function mouseX(e){return e.clientX - e.target.offsetLeft;}
function mouseY(e){return e.clientY - e.target.offsetTop;}


function mouseDown(e){
    var mousePoint = new Point(mouseX(e), mouseY(e), wip.length);
    additional = [];
    dragPoint = PointCollision(mousePoint);
    if(done){
        var polyEdges = poly2.getEdges();
        var startEdge = EdgeCollectionCollision(mousePoint, polyEdges);
        if(startEdge && startEdge.polygon) addToDrawing('face', startEdge, 'rgba(0,0,0,0.2)');
    }
    if(dragPoint){
        dragPoint.moveTo(mousePoint);
        document.addEventListener('mouseup', mouseUp);
        redraw();
        return;
    }
    if(!done){
        wip.push(mousePoint);
    }
    redraw();
}
function mouseUp(){
    dragPoint = null;
    additional = [];
    document.removeEventListener('mouseup', mouseUp);
}

function mouseMove(e){
    //console.log(e);
    var mousePoint = new Point(mouseX(e), mouseY(e), 'mouse');
    additional = [];

    tooltip.setXY(mousePoint);
    tooltip.setDragPoint('null');
    if(dragPoint!=null){
        dragPoint.moveTo(mousePoint);
        tooltip.setDragPoint(dragPoint.name);
        tooltip.showPoint(dragPoint, mousePoint);
        // redraw();
        // return;
    }

    var pointByMouse = PointCollision(mousePoint);
    var lineByMouse = LineCollision(mousePoint);
    if (!dragPoint && pointByMouse){
        tooltip.showPoint(pointByMouse, mousePoint);
    }else if(!dragPoint && lineByMouse){
        tooltip.showEdge(lineByMouse, mousePoint);
    }else{
        tooltip.clearHover();
    }
    redraw();
}

function keyPressEvent(e){
    if(e.key != 'Enter') return;
    if(done){
        console.log('making triangulation');
        var tri = new Triangulation();
        tri.poly = poly2;
        tri.makeMonotone();
        poly2 = tri.getPoly();
    }else {
        done = true;
        console.log('making poly');
        poly2 = new Poly();
        poly2.makeFromPointArray(wip);
        wip = [];
    }
    redraw();
}


//   -------======= Drawing Fucntions

function redraw(){
    stage.clear();
    if(!done){
        connectTheDots(wip);
    }
    if(poly2){
        drawPoly(poly2, 4, 'red');
    }
    if(additional.length){
        drawAdditional(additional);
    }
}

function connectTheDots(points){
    points.forEach(function(item, i, arr){
        stage.drawPoint(item, 6, "black");
        if(i+1 in arr){
            stage.drawLine(item, arr[i+1]);
        }
    });
}

function drawPoly(polygon, width=4, color="black"){
    var points = polygon.getPoints();
    points.forEach((item) => stage.drawPoint(item, width+2, color));

    var edges = polygon.getEdges();
    edges.forEach(item => stage.drawEdge(item, width, color));
}

function assureCCW(points){
    var sum = 0;
    for(var i=0; i<points.length-1; i++){
        sum += (points[i+1].x - points.x)*(points[i+1].y + points.y);
    }

    if(sum >= 0) return wip; //polygon is already CCW
    console.log('reversing');
    return wip.reverse();
}
function addToDrawing(type, el, color, width = undefined){
    additional.push({type:type, element:el, color:color, width:width});
}
function drawAdditional(items){
    items.forEach(function(item){
        switch(item.type){
            case 'face':
                stage.drawEdgeLoop(item.element, item.color)
                break;
            case 'line':
                stage.drawLine(item.element[0], item.element[1], item.width, item.color);
                break;
            case 'point':
                stage.drawPoint(item.element, item.width, item.color);
                break;
        }
    });
}



//    -----====  Collision Detection

function PointCollision(mouse){
    var points = done ? poly2.getPoints() : wip;
    return points.find( point => distanceAB(point, mouse) < 150 );
}

function LineCollision(mouse){
    var edges = done ? poly2.getEdges() : [];
    if(edges.length < 4) return null;
    return EdgeCollectionCollision(mouse, edges);
}

function EdgeCollectionCollision(p, edges){
    for (var i=0; i<edges.length; i++){
        if(edges[i].next == null) continue;

        var v = edges[i].origin;
        var w = edges[i].next.origin;
        var t = Math.max(0, Math.min(1, (dot(p,v,w) / v.distance2(w)))); //normalized dot product of VP, WP
        var l = lerp(v,w,t);

        if (debug){
            addToDrawing('line', [p,v], 'grey', 1);
            addToDrawing('line', [p,w], 'grey', 1);
            if(0 < t && t< 1){
                addToDrawing('line', [l,p], 'purple', 4);
                addToDrawing('point', l, 'green', 5);
            }
            addToDrawing('point', p, 'blue', 5);
        }
        if ( p.distance(l) < 15 && t < 0.5){ //distance to lerp along VW using t
            return edges[i];
        }
    }
    return null;
}

function distanceAB(a, b){
	return(sqr(a.x-b.x) + sqr(a.y-b.y));
 };
 function dot(a, o, b){
    //vector 1 is OA
    //vector 2 is OB
    return (a.x - o.x) * (b.x - o.x) + (a.y - o.y) * (b.y - o.y);
}
function lerp(a,b,t){
    return new Point(a.x + t*(b.x-a.x), a.y+t*(b.y-a.y), 'lerp');
}