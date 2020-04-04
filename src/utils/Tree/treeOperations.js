import {getNode, getParent, getTips} from "./treeSettersandGetters";

import {
    getDate,
    parseAnnotation,
    reconcileAnnotations,
    splitAtExposedCommas, splitNexusString,
    stripQuotes,
    typeAnnotations,
    verifyNewickString
} from "./parsing/treeParsingFunctions";
import {produce} from "immer";










export function orderByNodeDensity(tree,increasing = true) {
    const factor = increasing ? -1 : 1;
    const flipper = produce((draft)=>{
        if(draft.children) {
            draft.children.forEach((child,i)=>draft.children[i]=flipper(child));
            draft.children.sort((a, b) => factor * (getTips(a).length - getTips(b).length));
        }
    });
    return flipper(tree)
}


export function rotate(tree,nodeId) {
    return produce(tree,draft=>{
        const node= getNode(draft,nodeId);
        node.children.reverse();
    })
}

/**
 * Collapse nodes that return true from predicate
 * @param tree
 * @param predicate
 * @returns {Produced<Function, ReturnType<Function>>}
 */
export function collapseNodes(tree, predicate){
    const collapser = produce(draft=>{
        if(draft.children) {
            let lookAgain=false;
            do {
                lookAgain=false;
                draft.children = draft.children.reduce((acc, child) => {
                    if (predicate(child)) {
                        lookAgain=true; // collapsed node so need to see if this one is valid too. look again
                        child.children.forEach(kid => {
                            kid.length += child.length;
                            acc.push(kid)
                        });
                    } else {
                        acc.push(child);
                    }
                    return acc;
                }, []);
            }while(lookAgain);

            //TODO there could be a better way to pass the new children to the parent;
            draft.children.forEach((child,i)=>draft.children[i]=collapser(child));
        }
    });
    return collapser(tree);
}

/**
 * Annotate node of tree
 * @param tree
 * @param nodeId
 * @param annotation and object with annotation name as key and annotation value as value
 * @returns {<Base extends Immutable<Function>>(base?: *, ...rest: Tail<Recipe extends (...args: P) => any ? P : never>) => Produced<*, ReturnType<*>>}
 */
export function annotateNode(tree,nodeId,annotation){
    return produce(tree,draft=>{
            let node=getNode(draft,nodeId);
            for(const [key,value] of Object.entries(annotation)){
                node.annotations[key]=value;
            }
            node.annotationTypes = typeAnnotations(node.annotations);
            let parent = getParent(draft,node.id);
            while(parent){
                parent.annotationTypes=reconcileAnnotations(getNode(draft,node.id).annotationTypes,parent.annotationTypes)
                node=parent;
                parent = getParent(draft,node.id);
            }
    })
}

/**
 * Batch annotations on tree for performance boost when annotating many nodes.
 * @param tree
 * @param annotations - object with nodeId as key and annotation object as entry
 * @returns {<Base extends Immutable<Function>>(base?: *, ...rest: Tail<Recipe extends (...args: P) => any ? P : never>) => Produced<*, ReturnType<*>>}
 */
export function annotateNodes(tree,annotations){
    return produce(tree,draft=>{
        for(const [nodeId,annotation] of Object.entries(annotations)) {
            let node = getNode(draft, nodeId);
            for (const [key, value] of Object.entries(annotation)) {
                node.annotations[key] = value;
            }
            node.annotationTypes = typeAnnotations(node.annotations);
            let parent = getParent(draft, node.id);
            while (parent) {
                parent.annotationTypes = reconcileAnnotations(getNode(draft, node.id).annotationTypes, parent.annotationTypes)
                node = parent;
                parent = getParent(draft, node.id);
            }
        }
    })

}
