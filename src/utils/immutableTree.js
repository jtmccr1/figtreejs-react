import {extent,max} from "d3-array";
import {timeParse} from "d3-time-format";
import {decimalToDate} from "./utilities";
import BitSet from "bitset/bitset";

export const Type = {
    DISCRETE : Symbol("DISCRETE"),
    BOOLEAN : Symbol("BOOLEAN"),
    INTEGER : Symbol("INTEGER"),
    FLOAT: Symbol("FLOAT"),
    PROBABILITIES: Symbol("PROBABILITIES"),
    DATE:Symbol("DATE")
};
//TODO use immutable.js to really make immutable
export class ImmutableTree{
    constructor(tree){
        this.tree=tree;
        this.getDivergence=this.getDivergence();
    }
    getRoot(){
        return this.tree.root;
    }
    getNode(id){
/*        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }*/
        return this.tree.nodesById[id]
    }
    getParent(id){
/*        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }*/
        return this.getNode(id).parent
    }
    getChildren(id){
/*        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }*/
        return this.tree.nodesById[id].children;
    }
    getLength(id){
/*        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }*/
        return this.tree.nodesById[id].length;
    }
    getClade(id){
/*        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }*/
        return this.tree.nodesById[id].clade;
    }
    getClades(){
        return this.tree.clades;
    }
    getNodeAnnotations(id){
        return this.tree.annotationsById[id]
    }

    getAnnotation(id){
        return this.tree.annotationTypes[id]
    }
    getExternalNodes(){
        return this.tree.externalNodes;
    }
    getInternalNodes(){
        return this.tree.internalNodes;
    }
    getPostOrder(){
        return this.tree.postOrder;
    }


    getPreOrder(){
        return this.tree.postOrder.reverse();
    }
    getDivergence(){
/*        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }*/

        const self =this;
        const cache = {};
        return (function divergenceHelper(id) {
                let value;
                if (id in cache) {
                    value = cache[id];
                } else {
                    value = id!==self.getRoot()? divergenceHelper(self.getParent(id))+self.getLength(id):0;
                    cache[id] = value;
                }
                return value;
            })
    }
    getRootToTipLengths(){
        return this.tree.postOrder.map(id=>this.getDivergence(id))
    }

    getHeight(id){
/*        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }*/
        const self=this;
        let maxDivergence=null;
        return (function f(id) {
            if (!maxDivergence) {
                maxDivergence = max(self.getRootToTipLengths());
            }
            return maxDivergence-self.getDivergence(id);
        })(id)
    }

    orderByNodeDensity(increasing = true, node = this.getRoot()) {
        const factor = increasing ? 1 : -1;
        orderNodes.call(this, node, (nodeA, countA, nodeB, countB) => {
            return (countA - countB) * factor;
        });
        return this;
    }





    static  parseNexus(nexus,options={}){

        const trees=[];

        // odd parts ensure we're not in a taxon label
        //TODO make this parsing more robust
        const nexusTokens = nexus.split(/\s*(?:^|[^\w\d])Begin(?:^|[^\w\d])|(?:^|[^\w\d])begin(?:^|[^\w\d])|(?:^|[^\w\d])end(?:^|[^\w\d])|(?:^|[^\w\d])End(?:^|[^\w\d])|(?:^|[^\w\d])BEGIN(?:^|[^\w\d])|(?:^|[^\w\d])END(?:^|[^\w\d])\s*/)
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
                                const thisTree = ImmutableTree.parseNewick(treeString, {...options, tipMap,tipNames});
                                trees.push(thisTree);
                            }else{
                                const thisTree = ImmutableTree.parseNewick(treeString, {...options});
                                trees.push(thisTree);
                            }
                        }
                    }
                }
            }
        }
        return trees;
    }

    static parseNewick(newickString, options={}) {
        options ={...{labelName: "label",datePrefix:undefined,dateFormat:"%Y-%m-%d"},...options};

        verifyNewickString(newickString);
        let nodeCount=0;
        let tipCount=-1;
        let postOrderTally=-1;

        const treeData = {
            nodesById:{},
            annotationsById:{},
            annotationTypes:{},
            cladeMap:{},
            clades:[],
            externalNodes:[],
            internalNodes:[],
            postOrder:[],
            root:""}

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
                postOrder:(postOrderTally+=1),
        };

            if(node.children){
                for(const childId of node.children){
                    treeData.nodesById[childId].parent = node.id;
                }
            }

            node.clade= node.children? node.children.reduce((acc,child)=>acc.or(new BitSet(`0x${treeData.nodesById[child].clade}`)),new BitSet()).toString(16):
                    new BitSet([(options.tipNames?options.tipNames[name]:(tipCount+=1))]).toString(16);

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
            treeData.nodesById[node.id] = node;
            treeData.annotationsById[node.id] = annotations;
            treeData.annotationTypes=reconcileAnnotations(typedAnnotations,treeData.annotationTypes);
            treeData.cladeMap[node.clade] = node.id;
            if(!isInternalNode){
                treeData.externalNodes.push(node.id);
            }else{
                treeData.internalNodes.unshift(node.id);
            }
            treeData.postOrder.push(node.id);
            treeData.clades.push(node.clade);
            treeData.root=node.id;

            return node.id;
        }
        newickSubstringParser(newickString);

        return treeData;
    }

}

function copyChildClade(object,accessor,childData){
    for(const child of childData){
        for(const [key,value] of Object.entries(child[accessor])){
            object[key]=value
        }
    }
    return object;
}

function parseAnnotation(annotationString){
    const setRegex = /\{(.+)\}/;
    // const setRegex = /\{(.+)\}/;
    const out = {};
    for( const annotation of splitAtExposedCommas(annotationString)){

        let [annotationKey,data] = annotation.split("=");
        //TODO ensure this is working
            annotationKey=annotationKey.replace(/\./g,"_");
            if(setRegex.test(data)) {
                data = data.split(setRegex).filter(s => s !== "").reduce((acc,curr)=>acc.concat(splitAtExposedCommas(curr)),[]);
                if (data.reduce((acc, curr) => (acc & !isNaN(curr)), true)) {
                    data = data.map(d => parseFloat(d));
                }else{
                    data = data.reduce((acc,curr)=>acc.concat(curr.split(/[(?:\")')]/).filter(s=>s!=="")),[])
                }
                    out[annotationKey]=data;
            }else{
                data = data.split(/[(?:\")')]/).filter(s=>s!=="")[0] ;
                if(isNaN(data)){
                    out[annotationKey]=data
                }else{
                    out[annotationKey]=parseFloat(data);
                }
            }
    }
    return constructProbabilitySet(out)
}

function constructProbabilitySet(out){
    const keys =Object.keys(out);
    const finalObject ={};
    const skippedKeys = [];
    for(const probabilityKey of keys){

        if(/.+_set_prob/.test(probabilityKey)){
            const base = probabilityKey.split("_set_prob").filter(s=>s!=="")[0];
            const traitkey = `${base}_set`;
            const probabilities=[].concat(out[probabilityKey]);
            skippedKeys.push(traitkey);
            if(keys.includes(traitkey)) {
                const probabilitySet = {};
                for (let i = 0; i < out[traitkey].length; i++) {
                    probabilitySet[out[traitkey][i]] = probabilities[i];
                }
                finalObject[`${base}_probSet`] = {...probabilitySet};
            }
        }else if(!(skippedKeys.includes(probabilityKey)))
        finalObject[probabilityKey]=out[probabilityKey];
    }
    return finalObject;
}
export function reconcileAnnotations(incomingAnnotations,currentAnnotations={}){
    for (let [key, types] of Object.entries(incomingAnnotations)) {
        let annotation = currentAnnotations[key];
        if (!annotation) {
            currentAnnotations[key] = types;
        } else {
            const type = types.type;
            if (annotation.type !== type) {
                if ((type === Type.INTEGER && annotation.type === Type.FLOAT) ||
                    (type === Type.FLOAT && annotation.type === Type.INTEGER)) {
                    // upgrade to float
                    annotation.type = Type.FLOAT;
                    if (annotation.values) {
                        delete annotation.values;
                    }
                    annotation.extent = annotation.extent ? extent(annotation.extent.concat(types.extent)) : types.extent
                } else {
                    throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
                }
            } else if (annotation.type === type) {
                if (type === Type.DISCRETE) {
                    if (!annotation.values) {
                        annotation.values = new Set();
                    }
                    annotation.values = new Set([...annotation.values, ...types.values])
                } else if (annotation.values || types.values) {
                    annotation.values = annotation.values ? annotation.values.concat(types.values) : types.values
                } else if (annotation.extent || types.extent) {
                    annotation.extent = annotation.extent ? extent(annotation.extent.concat(types.extent)) : types.extent
                }
            }
        }
    }
    return currentAnnotations;
}

function typeAnnotations(annotations){
    let annotationTypes={};
    for (let [key, addValues] of Object.entries(annotations)) {
            const annotation = {};
             annotationTypes[key] = annotation;
        if(addValues instanceof Date){
            annotation.type=Type.DATE;
            annotation.extent = [addValues,addValues];
        } else if (Array.isArray(addValues)) {
            // is a set of  values
            let type;
            if(addValues.map(v=>isNaN(v)).reduce((acc,curr)=>acc&&curr,true)) {
                type = Type.DISCRETE;
                annotation.type = type;
                if (!annotation.values) {
                    annotation.values = new Set();
                }
                annotation.values.add(...addValues);
            }else if(addValues.map(v=>parseFloat(v)).reduce((acc,curr)=>acc&&Number.isInteger(curr),true)){
                type =Type.INTEGER;
                annotation.extent=extent(addValues)
            }else{
                type = Type.FLOAT;
                annotation.extent=extent(addValues)
            }

            if (annotation.type && annotation.type !== type) {
                if ((type === Type.INTEGER && annotation.type === Type.FLOAT) ||
                    (type === Type.FLOAT && annotation.type === Type.INTEGER)) {
                    // upgrade to float
                    type = Type.FLOAT;
                    annotation.type = Type.FLOAT;
                    if(annotation.values){
                        delete annotation.values;
                    }else{
                        throw Error(`existing values of the annotation, ${key}, in the tree is discrete.`);
                    }
                }
            }
            annotation.type=type;
            // annotation.values = annotation.values? [...annotation.values, ...addValues]:[...addValues]
        } else if (Object.isExtensible(addValues)) {

            // is a set of properties with values
            let type = undefined;
            let sum = 0.0;
            let keys = [];
            for (let [key, value] of Object.entries(addValues)) {
                if (keys.includes(key)) {
                    throw Error(`the states of annotation, ${key}, should be unique`);
                }
                if (typeof value === typeof 1.0) {
                    // This is a vector of probabilities of different states
                    type = (type === undefined) ? Type.PROBABILITIES : type;

                    if (type === Type.DISCRETE) {
                        throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                    }

                    sum += value;
                    if (sum > 1.01) {
                        throw Error(`the values of annotation, ${key}, should be probabilities of states and add to 1.0`);
                    }
                } else if (typeof value === typeof true) {
                    type = (type === undefined) ? Type.DISCRETE : type;

                    if (type === Type.PROBABILITIES) {
                        console.warn(annotations)
                        throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                    }
                } else {
                    throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                }
                keys.push(key);
            }
            if (annotation.type && annotation.type !== type) {
                throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
            }
            annotation.type = type;
            annotation.values = annotation.values? [...annotation.values, addValues]:[addValues]
        } else {
            let type = Type.DISCRETE;

            if (typeof addValues === typeof true) {
                type = Type.BOOLEAN;
            } else if (!isNaN(addValues)) {
                type = (addValues % 1 === 0 ? Type.INTEGER : Type.FLOAT);
            }

            if (annotation.type && annotation.type !== type) {
                if ((type === Type.INTEGER && annotation.type === Type.FLOAT) ||
                    (type === Type.FLOAT && annotation.type === Type.INTEGER)) {
                    // upgrade to float
                    type = Type.FLOAT;
                } else {
                    throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
                }
            }

            if (type === Type.DISCRETE) {
                if (!annotation.values) {
                    annotation.values = new Set();
                }
                annotation.values.add(addValues);
            }else if( type===Type.FLOAT|| type===Type.INTEGER){
                annotation.extent=[addValues,addValues]
            }

            annotation.type = type;
        }

        // overwrite the existing annotation property
        // annotationTypes[key] = annotation;
    }
    return annotationTypes;
}

function stripQuotes(string){
        // remove any quoting and then trim whitespace
    return removeEndQuotes(removeFrontQuotes(string))
}
function removeFrontQuotes(s){
    if (s.startsWith("\"") || s.startsWith("\'")) {
         return s.slice(1);
    }
    return s;
}

function removeEndQuotes(s){
    if (s.endsWith("\"") || s.endsWith("\'")) {
        return s.slice(0, s.length - 1);
    }
    return s;
}
function verifyNewickString(s){
    if(s[s.length-1]!==";"){
        throw new Error("Unknown format. Newick strings should end in ;")
    }
    if(((s.match(/\(/g) || []).length)!==((s.match(/\)/g) || []).length)){
    throw new Error("Unmatched parenthesis in newick string")
    }
}

function getDate(name,datePrefix,dateFormat){
        const parts = name.split(datePrefix);
        if (parts.length === 0) {
            throw new Error(`the tip, ${name}, doesn't have a date separated by the prefix, '${datePrefix}'`);
        }
        const dateBit = parts[parts.length-1];
        if(dateFormat==="decimal"){
           const decimalDate = parseFloat(parts[parts.length - 1]);
            return decimalToDate(decimalDate);
        }else{
            let date = timeParse(dateFormat)(dateBit);
            if(!date){
                date = timeParse(dateFormat)(`${dateBit}-15`)
            }
            if(!date){
                date = timeParse(dateFormat)(`${dateBit}-06-15`)
            }
            return date
        }
}
//TODO speed up - it's slow to do this everytime essentially nested looping
export function splitAtExposedCommas(string){
    const open=["(","[","{"];
    const close=[")","]","}"];
    let count=0;
    const commas=[-1];

    const stringLength= string.length;
    for(let i=0;i<stringLength;i++){
        if(open.includes(string[i])){
            count+=1;
        }else if(close.includes(string[i])){
            count-=1;
        }else if(count===0 &&string[i]===","){
            commas.push(i)
        }
    }
    commas.push(string.length);

    const splits = [];
    const commaLength = commas.length;
    for(let i=1;i<commaLength;i++){
        splits.push(string.slice(commas[i-1]+1,commas[i]))
    }
    return splits;

}

function orderNodes(node, ordering) {
    let count = 0;
    if (this.getChildren(node)) {
        // count the number of descendents for each child
        const counts = new Map();
        for (const child of this.getChildren(node)) {
            const value = orderNodes.call(this,child, ordering);
            counts.set(child, value);
            count += value;
        }

        // sort the children using the provided function
        this.getNode(node).children = this.getNode(node).children.sort((a, b) => {
            return ordering(a, counts.get(a), b, counts.get(b),node)
        });

        const postOrder =[],
            exetrnal=[],
            internal=[];

        for (const id of postorder(this.getRoot(),this)){
            postOrder.push(id);
            if(this.getChildren(id)){
                internal.push(id)
            }else{
                exetrnal.push(id)
            }
        }


        this.tree.postOrder = postOrder;
        this.tree.externalNodes = exetrnal;
        this.tree.internalNodes = internal;


    } else {
        count = 1
    }
    return count;
}

/**
 * A generator function that returns the nodes in a post-order traversal
 *
 * @returns {IterableIterator<IterableIterator<*|*>>}
 */
function *postorder(startNode,tree) {
    const traverse = function *(node) {
            if (tree.getChildren(node)) {
                for (const child of tree.getChildren(node)) {
                    yield* traverse(child);
                }
            }
            yield node;
    };

    yield* traverse(startNode);
}