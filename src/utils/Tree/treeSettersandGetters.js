import {max,sum} from "d3-array";
import {produce} from "immer";
import {memoize} from "../utilities";


const nodeCalls ={self:Symbol("self"),parent:Symbol("parent")}
/**
 * This is a cached private function that returns the node or the nodes parent from a provided tree
 * It is used internally in getNode and getParent. It is used to cache a central parent and node cacheing
 * to reduce overall tree traversal.
 * @type {nodeGetter}
 */
const nodeGetter=(function(){
    const nodeCache = new Map();
    const parentCache = new Map();
    return function nodeGetter(tree,nodeId,call=nodeCalls.self) {
        if (!nodeCache.has(tree)) {
            nodeCache.set(tree, new Map())
        }
        if (!parentCache.has(tree)) {
            parentCache.set(tree, new Map())
        }
        // return cached if present
        if (call === nodeCalls.self && nodeCache.has(tree) && nodeCache.get(tree).has(nodeId)) {
            return nodeCache.get(tree).get(nodeId)
        } else if (call === nodeCalls.parent && parentCache.has(tree) && parentCache.get(tree).has(nodeId)) {
            return parentCache.get(tree).get(nodeId)
        } else {
            // traverse tee and set up maps as far as needed
            //TODO don't get and set everytime
            nodeCache.get(tree).set(nodeId,tree);
            if (call === nodeCalls.self) {
                if (tree.id === nodeId) {
                    return tree;
                }
            }else if (tree.children !== null) {
                    for (const child of tree.children) {
                        parentCache.get(tree).set(child.id,node);
                        if(call===nodeCalls.parent){
                            if(child.id===nodeId){
                                return tree;
                            }
                        }
                        const result = nodeGetter(child, nodeId, call);
                        const thisCache=nodeCache.get(tree);
                        const thisParentCache=parentCache.get(tree);
                        nodeCache.get(child).forEach((v,k)=>thisCache.set(k,v));
                        parentCache.get(child).forEach((v,k)=>thisParentCache.set(k,v));
                        if (result) {
                            return result;
                        }
                    }
                }
            }
        return null;
    }
}());

export function getParent(tree,nodeId) {
            return nodeGetter(tree,nodeId,nodeCalls.parent)
}
export function getNode(tree,nodeId){
    return nodeGetter(tree,nodeId,nodeCalls.self)

}

export function getDivergence(tree,node){
    const cache = new Map();
    if (!cache.has(tree)) {
        cache.set(tree, new Map())
    }
    if (cache.has(tree) && cache.get(tree).has(node)) {
        return cache.get(tree).get(node)
    }

    if(node===tree){
        return 0;
    }
    else{
        const result =node.length+getDivergence(tree,getParent(tree,node.id));
        cache.get(tree).set(node,result);
        return result;
    }
}

function getNodesSimple(tree){
    if(tree.children===null){
        return [tree];
    }
    const childrenOutput = tree.children.map(child=>getNodesSimple(child)).sort();

    return produce(childrenOutput[0],draft=>{
        for(const node of childrenOutput[1]){
            draft.push(node)
        }
        draft.push(tree);
    })
}

export const getNodes=memoize(getNodesSimple);

export function getRootToTipLengths(tree){
   return getNodes(tree).map(node=>getDivergence(tree,node))
}


function getTipsSimple(tree){
   if(tree.children===null){
       return tree;
   }else{
       return tree.children.reduce((list,child)=>list.concat(getTipsSimple(child)),[]);
   }
}
export const getTips = memoize(getTipsSimple);





