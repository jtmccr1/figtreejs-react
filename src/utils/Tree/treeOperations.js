import {getChildren, getLength, getNode, getParent, getRoot, getTips} from "./treeSettersandGetters";

import {
    getDate,
    parseAnnotation,
    reconcileAnnotations,
    splitAtExposedCommas,
    stripQuotes,
    typeAnnotations,
    verifyNewickString
} from "./treeParsingFunctions";
import {produce} from "immer";


export function parseNewick(newickString, options={}) {
    options ={...{labelName: "label",datePrefix:undefined,dateFormat:"%Y-%m-%d"},...options};
    let nodeCount=0;

    verifyNewickString(newickString);
    function newickSubstringParser(newickString){
        // check for semicolon
        //strip first and last parenthesis and annotations ect. call again on children.
//https://www.regextester.com/103043
        //                      [children]data - name, label, branch length ect.
        const internalNode =/\((.*)\)(.*)/;
        // identify commas not included in (),[],or {}
        const nodeData = /(?:(.*)(?=\[&))?(?:\[&(.+)])?(?:(.+)(?=:))?:(\d+\.?\d*(?:[eE]-?\d+)?)/g;
        const isInternalNode = internalNode.test(newickString);
        let nodeString,
            childrenString,
            childNodes=[];
        if(isInternalNode){
            [childrenString,nodeString] = newickString.split(internalNode).filter(s=>s);
            const children = splitAtExposedCommas(childrenString);

            for(const child of children){
                childNodes.push(newickSubstringParser(child))
            }
        }else{
            nodeString = newickString;
        }
        //TODO get rid of leading and trailing empty matches
        let [emptyMatch,name,annotationsString,label,length,emptyMatch2]=nodeString.split(nodeData);

        if(!isInternalNode&&!annotationsString){
            name=label;
            label=null;
        }else if(isInternalNode&&name){
            label=name;
            name=null;
        }

        if(name){
            name = options.tipMap?stripQuotes(options.tipMap[name]):stripQuotes(name)
        }
        if(label){
            label = stripQuotes(label)
        }
        const node = {
            id:name?name:label?(options.labelName==="label"?label:(`node${(nodeCount+=1)}`)): (`node${(nodeCount+=1)}`),
            name:name?name:null,
            length:length!==undefined?parseFloat(length):null,
            children:childNodes.length>0?childNodes:null,
        };
        const annotations = annotationsString!==undefined? parseAnnotation(annotationsString):{};
        if(options.labelName!=="label"){
            if(label){
                annotations[options.labelName]=label;
            }
        }
        let date;
        if(options.datePrefix && name){
            date =getDate(name,options.datePrefix,options.dateFormat);
            annotations.date = date;
        }
        const typedAnnotations = typeAnnotations(annotations);
        node.annotations= annotations;
        node.annotationTypes=childNodes?[typedAnnotations,...childNodes.map(c=>c.annotationTypes)].reduce((acc,curr)=>reconcileAnnotations(curr,acc),{}):typedAnnotations;
        return node;
    }
    const root = newickSubstringParser(newickString);
    return root;
}



//Note to self!  tree data is the output from all these. Tree data is immutable and goes into the f
// figtreejs react functions. these function are for use in the react api. The tree class
// wraps this data and provides these functions as methods simulating mutable data. It also
// will take a call back so it can pass updated trees into a react component or even
// the d3 bindings.
/**
 * Re-roots the tree at the midway point on the branch above the given node.
 *
 * @param {object} nodId - The node to be rooted on.
 * @param proportion - proportion along the branch to place the root (default 0.5)
 */

function reroot(tree, nodeId, proportion = 0.5) {
    if (nodeId === getRoot(tree)) {
        // the node is the root - nothing to do
        return;
    }

    const rootLength = getLength(tree,getChildren(tree,getRoot(tree))[0]) + getLength(tree,getChildren(tree,getRoot(tree))[1]);

    if (getParent(tree,nodeId) !== getRoot(tree)) {
        // the node is not a child of the existing root so the root is actually changing

        let node0 = nodeId;
        let parent = getParent(tree,nodeId);

        let lineage = [ ];

        // was the node the first child in the parent's children?
        const nodeAtTop =  getChildren(tree,parent)[0]===nodeId;

        const rootChild1 = nodeId;
        const rootChild2 = parent;

        let oldLength = getLength(tree,parent);

        while (getParent(tree,parent)) {

            // remove the node that will becoming the parent from the children
            parent._children = parent.children.filter((child) => child !== node0);

            if (parent.parent === this.rootNode) {
                const sibling = this.getSibling(parent);
                parent._children.push(sibling);
                sibling._length = rootLength;
            } else {
                // swap the parent and parent's parent's length around
                [parent.parent._length, oldLength] = [oldLength, parent.parent.length];

                // add the new child
                parent._children.push(parent.parent);
            }

            lineage = [parent, ...lineage];

            node0 = parent;
            parent = parent.parent;
        }

        // Reuse the root node as root...

        // Set the order of the children to be the same as for the original parent of the node.
        // This makes for a more visually consistent rerooting graphically.
        this.rootNode.children = nodeAtTop ? [rootChild1, rootChild2] : [rootChild2, rootChild1];

        // connect all the children to their parents
        this.internalNodes
            .forEach((node) => {
                node.children.forEach((child) => {
                    child._parent = node;
                })
            });

        const l = rootChild1.length * proportion;
        rootChild2._length = l;
        rootChild1._length = rootChild1.length - l;

    } else {
        // the root is staying the same, just the position of the root changing
        const l = nodeId.length * (1.0 - proportion);
        nodeId._length = l;
        this.getSibling(nodeId)._length = rootLength - l;
    }
};


export function orderByNodeDensity(tree,nodeId,increasing = true) {
    const factor = increasing ? 1 : -1;

    return produce(tree, draft => {
        const node = getNode(draft, nodeId);
        orderNodes(node, (nodeA, countA, nodeB, countB) => {
            return (countA - countB) * factor;
        });
    });
}

function orderNodes(node, ordering) {
    let count = 0;
    if (node.children!==null) {
        // count the number of descendents for each child
        const counts = new Map();
        for (const child of node.children) {
            counts.set(child, getTips(child).length);
        }

        // sort the children using the provided function
        node.children = node.children.sort((a, b) => {
            return ordering(a, counts.get(a), b, counts.get(b),node)
        });
    } else {
        count = 1
    }
    return count;
}