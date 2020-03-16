import {produce} from "immer";
import {dateToDecimal, decimalToDate, memoize, mergeMaps, setParentMap} from "../utilities";
import {timeYear} from "d3-time";

const nodeCalls ={self:Symbol("self"),parent:Symbol("parent")}
/**
 * This is a cached private function that returns the node or the nodes parent from a provided tree
 * It is used internally in getNode and getParent. It is used to cache a central parent and node cacheing
 * to reduce overall tree traversal.
 * @type {nodeGetter}
 */


export function getParent(tree,nodeId) {
            return nodeGetter(tree,nodeId,nodeCalls.parent)
}
//TODO return null if node not in tree;
const nodeGetter=(function(){
        const cache=new Map();
        return function nodeGetter(tree,nodeId,call){
            if (!cache.has(tree)) {
                // This is the first time looking for nodes in this tree
                cache.set(tree, new Map([[tree.id,{node:tree}]]));
                if(tree.children===null){
                    if(call===nodeCalls.self && tree.id===nodeId){
                        return tree;
                    }
                    return null;
                }else{
                    // we are here do we need to update downstream?
                    let result= call===nodeCalls.self?(tree.id===nodeId?tree:null):tree.children.map(c=>c.id).includes(nodeId)?tree:null;
                    for(const child of tree.children){
                        if(cache.has(child)){

                                result=result?result:(cache.get(child).has(nodeId)?(call===nodeCalls.self?cache.get(child).get(nodeId).node:cache.get(child).get(nodeId).parent):null) ;

                        }else{
                            const downStreamSearch =nodeGetter(child,nodeId,call);
                            result=result?result:downStreamSearch;
                        }
                        const updatedTreeMap=setParentMap(mergeMaps(cache.get(tree),cache.get(child)),child,tree);
                        cache.set(tree,updatedTreeMap)
                    }
                    return result;
                }
            }else{
               return call===nodeCalls.self?cache.get(tree).get(nodeId).node:cache.get(tree).get(nodeId).parent;
            }
        }

}());

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


export function *getNodesIterator(tree){
    const traverse = function *(tree) {
            if (tree.children) {
                for (const child of tree.children) {
                    yield* traverse(child);
                }
            }
            yield tree;
    };

    yield* traverse(tree);
}

export function getNodes(tree){
    return [...getNodesIterator(tree)];
}

export function getRootToTipLengths(tree){
   return getNodes(tree).map(node=>getDivergence(tree,node))
}


// function getTipsSimple(tree){
//    if(tree.children===null){
//        return tree;
//    }else{
//        return tree.children.reduce((list,child)=>list.concat(getTipsSimple(child)),[]);
//    }
// }
// export const getTips = memoize(getTipsSimple);
export function getTips(tree){
    return [...getNodesIterator(tree)].filter(n=>!n.children);
}

export function getDateRange(tree,scale=1){
    const mostRecentDate = tree.annotationTypes.date.extent[1];
    const rootHeight = getDivergence(tree,getNodes(tree).find(node=>node.annotations.date===mostRecentDate));
    const rootDate = decimalToDate(dateToDecimal(mostRecentDate) -rootHeight);
    return [rootDate,mostRecentDate]
}


export function setLength(tree,nodeid,length){
    return produce(tree,draft=>{
      const node = getNode(draft,nodeid);
      node.length=length;
    })
}
