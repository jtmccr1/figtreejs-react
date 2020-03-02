import {max} from "d3-array";
import {List} from "immutable";
export function getRoot(tree){
    return tree.get("root");
}


export const treeFactory=(function() {
    const cache=new Map();


    return function treeFactory(tree) {

        if(cache.has(tree)){
            return cache.get(tree);
        }else {
            const node = tree.toObject();
            if (node.children) {
                node.children = node.children.map(child => treeFactory(child))
            }
            node.annotations=node.annotations.toObject();
            node.annotationTypes=node.annotationTypes.toObject();
            Object.freeze(node);
            cache.set(tree,node);
            return node;
        }
    }
}());

export function getNode(tree,nodeId){
    //TODO cache by tree and nodeId
    const node = getImmutableNode(tree,nodeId);
    return treeFactory(node);
}

function getImmutableNode(tree,nodeId){
    return tree.getIn(getPathToNode(tree,nodeId));
}

//TODO think about caching all the way there.
const getPathToNode=(function() {
    const cache = new Map();
    return function getPathToNode(tree, nodeId) {
        if (!cache.has(tree)) {
            cache.set(tree, new Map())
        }
        if (cache.has(tree) && cache.get(tree).has(nodeId)) {
            return cache.get(tree).get(nodeId)
        } else {
            if (tree.get("id") === nodeId) {
                return new List([]);
            } else if (tree.get("children") !== null) {
                let i=0;
                for (const child of tree.get("children")) {
                    const result = getPathToNode(child, nodeId);
                    if (result) {
                       const fullPath=new List(["children",i]).concat(result);
                        cache.get(tree).set(nodeId, fullPath);
                        return fullPath;
                    }
                    i+=1;
                }
            }
        }
    }
}());

    //
    //
    // //(if tree.id === nodeId return)
    // //at every step set cache.tree.nodeid===node;
    // return traverseAndGet(tree,(node)=>node.get("id")===nodeId);

export function getParent(tree,nodeId) {
    return tree.getIn(getPathToNode(tree,nodeId).pop().pop().push("id"));
}


export function getDivergence(tree,nodeId){
    const node = getImmutableNode(tree,nodeId);
    if(node===tree){
        return 0;
    }
    else{
        return node.get("length")+getDivergence(tree,getParent(tree,nodeId));
    }
}


const getExternalNodes = (function(){
    const cache=new Map();
    return function getExternalNodes(tree){
        if(cache.has(tree)){
            return cache.get(tree);
        }else{
            let result;
            if(tree.get("children")===null){
                result = [tree.get("id")];
            }else{
                result =  tree.get("children")
                    .reduce((acc,curr)=>acc.concat(getExternalNodes(curr)),[]);
            }
            cache.set(tree,result);
            return result;
        }
    }
}());




export function getTips(tree,nodeId){
   return getExternalNodes(getImmutableNode(tree,nodeId))
}




function getRootHeight(tree){
    if(tree.get("children")===null){
        return 0;
    }
    else{
        return max(tree.get("children").map(child=>getRootHeight(child)+child.get("length")));
    }
}

function memoize(fn){
    const cache=new Map();
    return function(arg){
        if(cache.has(arg)){
            return cache.get(arg);
        }else{
            const result = fn(arg);
            cache.set(arg,result);
            return result;
        }
    }
}



function traverseAndGet(tree,predicate){
    if(predicate(tree)){
        return tree;
    }else if(tree.get("children")){
        for(const child of tree.get("children")){
            const output= traverseAndGet(child,predicate);
            if(output){
                return output
            }
        }
    }
}
