import {getNode, getParent, getTips} from "./treeSettersandGetters";

import {
    getDate,
    parseAnnotation,
    reconcileAnnotations,
    splitAtExposedCommas, splitNexusString,
    stripQuotes,
    typeAnnotations,
    verifyNewickString
} from "./treeParsingFunctions";
import {produce} from "immer";






export function parseNewick(newickString, options={}) {
    options ={...{labelName: "label",datePrefix:undefined,dateFormat:"%Y-%m-%d"},...options};

    const str = Array.from(newickString.trim());
    // skipuntil "("  skip spaces
    // set last character to "(" - unreadCharacterCall


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
    const root = newickSubstringParser(newickString.trim());
    return root;
}


export function   parseNexus(nexus,options={}){

        const trees=[];

        // odd parts ensure we're not in a taxon label
        //TODO make this parsing more robust
        const nexusTokens = splitNexusString(nexus);
        const firstToken = nexusTokens.shift().trim();
        if(firstToken.toLowerCase()!=='#nexus'){
            throw Error("File does not begin with #NEXUS is it a nexus file?")
        }
        for(const section of nexusTokens){
            const workingSection = section.replace(/^\s+|\s+$/g, '').split(/\n/);
            const sectionTitle = workingSection.shift();
            if(sectionTitle.toLowerCase().trim() ==="trees;"){
                let inTaxaMap=false;
                const tipMap ={};
                const tipNames={};
                for(const token of workingSection){
                    if(token.trim().toLowerCase()==="translate"){
                        inTaxaMap=true;
                    }else{
                        if(inTaxaMap){
                            if(token.trim()===";"){
                                inTaxaMap=false;
                            }else{
                                const taxaData = token.trim().replace(",","").split(/\s*\s\s*/);
                                tipMap[taxaData[0]]=taxaData[1];
                                tipNames[taxaData[1]]=taxaData[0];
                            }
                        }else{
                            const treeString = token.substring(token.indexOf("("));
                            if(Object.keys(tipMap).length>0) {
                                const thisTree = parseNewick(treeString, {...options, tipMap,tipNames});
                                trees.push(thisTree);
                            }else{
                                const thisTree = parseNewick(treeString, {...options});
                                trees.push(thisTree);
                            }
                        }
                    }
                }
            }
        }
        return trees;
}


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
