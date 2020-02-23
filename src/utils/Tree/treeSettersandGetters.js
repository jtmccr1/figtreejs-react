export function getRoot(tree){
    return tree.get("root");
}
export function getNode(tree,id){
    return tree.getIn(["nodesById",id]);
}
export function getParent(tree,id) {
    return getNodeAttribute(tree,id,"parent")
}

export function setParent(tree,nodeId,parent){
    return tree.setIn(["nodesById",nodeId,parent],parent)
}

export function getChildren(tree,id){
    return getNodeAttribute(tree,id,"children")
}

export function addChild(tree,nodeId,child){
    return tree.updateIn(["nodesById",nodeId,"children"],(children)=>children.push(child))
}

export function removeChild(tree,nodeId,child){
    return tree.updateIn(["nodesById",nodeId,"children"],(children)=>children.filter(c=>c!==child))
}
export function setChildren(tree,nodeId,children){
    return tree.setIn(["nodesById",nodeId,"children"],children);
}
export function getLength(tree,id){
    return getNodeAttribute(tree,id,"length")
}

export function setLength(tree,id,length){
    return setNodeAttribute(tree,id,"length",length);
}

export function getClade(id){
    return getNodeAttribute(tree,id,"clade")
}
export function getClades(tree){
    return tree.get("clades");
}
export function getNodeAnnotations(tree,id){
    return tree.getIn(["AnnotationsById",id]);
}

export function getAnnotationSummary(tree){
    return tree.get("AnnotationSymmary");
}

export function getSummary(tree,annotation){
    return tree.getIn(["AnnotationSymmary",annotation]);
}
export function getExternalNodes(tree){
    return tree.get("ExternalNodes");
}

export function getInternalNodes(tree){
    return tree.get("InternalNodes");
}
export function getPostOrder(tree){
    return tree.get("postOrder");
}
export function getPreOrder(tree){
    return tree.get("postOrder").reverse();
}
export function getNodeAttribute(tree,id,attr){
    return tree.getIn(['nodesById',id,attr])
}

export function setNodeAttribute(tree,id,attr,value){
    return tree.setIn(['nodesById',id,attr],value)
}
