function BinarySearchTree(){
  this.root = null;
}

BinarySearchTree.prototype.insert = function(val){
   var root = this.root;

   if(!root){
      this.root = new Node(val);
      return;
   }

   var currentNode = root;
   var newNode = new Node(val); 

    while(currentNode){
        if(val < currentNode.value){
            if(!currentNode.left){
                currentNode.left = newNode;
                break;
            }else{
                currentNode = currentNode.left;
            }
        }else{
            if(!currentNode.right){
                currentNode.right = newNode;
                break;
            }else{
                currentNode = currentNode.right;
            }
        }
    }
}


BinarySearchTree.prototype.remove = function (value) {
    this.root = this._removeInner(value, this.root);
}

BinarySearchTree.prototype._removeInner = function (value, node) {
    if (node) {
        if (value < node.value) {
            node.left = this._removeInner(value, node.left);
        } else if (value > node.value) {
            node.right = this._removeInner(value, node.right);
        } else if (node.left && node.right) {
            node.value = this.findMinValue(node.right);
            node.right = this._removeInner(node.value, node.right);
        } else {
            node = node.left || node.right;
        }
    }
    return node;
}
