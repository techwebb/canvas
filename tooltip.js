function Tooltip(document){
    this.xElement = document.getElementById('xDisplay');
    this.yElement = document.getElementById('yDisplay');
    this.dragElement = document.getElementById('dragDisplay');
    this.hoverElement = document.getElementById('mouseHoverDisplay');
}

Tooltip.prototype.setXY = function(point){
    this.xElement.innerHTML = point.x;
    this.yElement.innerHTML = point.y;
}

Tooltip.prototype.setDragPoint = function(text){
    this.dragElement.innerHTML = text;
}

Tooltip.prototype.showPoint = function(point, mouse){
    this.hoverElement.innerHTML = point.toHTML();
    this.hoverElement.style.visibility = "visible";
    if(point.y < 100){
        this.hoverElement.style.top = point.y-(this.hoverElement.offsetHeight/2)+"px"; 
        this.hoverElement.style.left = Math.min(point.x, mouse.x)+15+"px";
    }else{
        this.hoverElement.style.top = Math.min(point.y, mouse.y)-90+"px";
        this.hoverElement.style.left = point.x-(this.hoverElement.offsetWidth/2)+"px"; 
    }
}

Tooltip.prototype.showEdge = function(edge, mouse){
    this.hoverElement.innerHTML = edge.toHTML();
    this.hoverElement.style.visibility = "visible";
    this.hoverElement.style.top = Math.min((edge.origin.y+edge.next.origin.y)/2, mouse.y-30)-50+"px";
    this.hoverElement.style.left = (edge.origin.x+edge.next.origin.x)/2-(this.hoverElement.offsetWidth/2)+"px"; 
}

Tooltip.prototype.clearHover = function(){
    this.hoverElement.innerHTML = "";
    this.hoverElement.style.visibility = "hidden";
}