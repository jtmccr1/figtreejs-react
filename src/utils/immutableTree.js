import {Type} from "./tree";
import {extent,max} from "d3-array";
import {timeParse} from "d3-time-format";
import {decimalToDate} from "./utilities";
import {BitSet} from "bitset/bitset";

export class ImmutableTree{
    constructor(tree){
        this.tree=tree;
    }
    getRoot(){
        return this.tree.root;
    }
    getNode(id){
        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }
        return {...this.tree.nodesById[id]}
    }
    getParent(id){
        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }
        const node= this.getNode(id);
        if("parent" in node){
            return node.parent;
        }else{
            return null;
        }
    }
    getChildren(id){
        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }
        return this.tree.nodesById[id].children;
    }
    getLength(id){
        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }
        return this.tree.nodesById[id].length;
    }
    getClade(id){
        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }
        return this.tree.nodesById[id].clade;
    }
    getClades(){
        return this.tree.clades;
    }
    getNodeAnnotations(id){
        return {...this.tree.annotationsById[id]}
    }

    getAnnotation(id){
        return {...this.tree.annotationTypes[id]}
    }
    getExternalNodes(){
        return [...this.tree.externalNodes];
    }
    getInternalNodes(){
        return [...this.tree.internalNodes];
    }
    getPostOder(){
        return [...this.tree.postOrder];
    }
    getPreOrder(){
        return [...this.tree.postOrder].reverse();
    }
    getDivergence(id){
        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }

        const self =this;
        const cache = {};
        return (function f(id) {
                let value;

                if (id in cache) {
                    value = cache[id];
                } else {
                    value = id!==self.getRoot()? f(self.getParent(id))+self.getLength(id):0;
                    cache[id] = value;
                }
                return value;
            })(id)
    }
    getRootToTipLengths(){
        return this.tree.postOrder.map(id=>this.getDivergence(id))
    }

    getHeight(id){
        if(!(id in this.tree.nodesById)){
            throw new Error(`id ${id} not recognized in tree`)
        }

        const self=this;
        let maxDivergence=null;
        return (function f(id) {
            if (!maxDivergence) {
                maxDivergence = max(self.getRootToTipLengths());
            }
            return maxDivergence-self.getDivergence(id);
        })(id)
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
                            if(tipMap.size>0) {
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

        function newickSubstringParser(newickString){
            // check for semicolon
            //strip first and last parenthesis and annotations ect. call again on children.
//https://www.regextester.com/103043
            //                      [children]data - name, label, branch length ect.
            const internalNode =/\((.*)\)(.*)/;
            // identify commas not included in (),[],or {}
            const exposedCommas=/,(?=(?:(?:(?![\)]).)*[\(])|[^\(\)]*$)(?=(?:(?:(?![\]]).)*[\[])|[^\[\]]*$)(?=(?:(?:(?![\}]).)*[\{])|[^\{\{]*$)/g;
            const nodeData = /(.*?)(?:\[&?(.*)\])*(?:#(.+))*(.*):(\d*\.?\d*)/g;
            const isInternalNode = internalNode.test(newickString);
            let nodeString,
                childrenString,
                childNodes=[];
            if(isInternalNode){
                [childrenString,nodeString] = newickString.split(internalNode).filter(s=>s);
                console.group("Internal")
                console.log(childrenString);
                console.log(nodeString);
                console.groupEnd();
                const children = childrenString.split(exposedCommas);
                //TODO make test and fix exposed commas regex that fails on large dataset
                console.group("split")
                console.log(children);

                for(const child of children){
                   childNodes=childNodes.concat(newickSubstringParser(child))
                }
            }else{
                nodeString = newickString;
            }
            //TODO get rid of leading and trailing empty matches
            let [emptyMatch,name,annotationsString,id,label,length,emptyMatch2]=nodeString.split(nodeData);

            if(name){
                name = options.tipNames?options.tipNames[name]:stripQuotes(name)
            }
            if(label){
                label = stripQuotes(label)
            }

            const node = {
                id:name?name:id?id:(`node${(nodeCount+=1)}`),
                name:name?name:null,
                label:label?label:null,
                length:length!==undefined?parseFloat(length):null,
                children:childNodes.length>0?childNodes.map(n=>n.root):null,
                postOrder:(postOrderTally+=1),
        };

            const descendentNodesById ={...childNodes.reduce((acc,curr)=>({...acc,...curr.nodesById}),{})};
            if(node.children){
                for(const childId of node.children){
                    descendentNodesById[childId].parent = node.id;
                }
            }

            node.clade= node.children? node.children.reduce((acc,child)=>acc.or(new BitSet(descendentNodesById[child].clade)),new BitSet()).toString():
                    new BitSet([(options.tipMap?options.tipMap[name]:(tipCount+=1))]).toString();

            const annotations = annotationsString!==undefined? parseAnnotation(annotationsString):{};
            let date;
            if(options.datePrefix && name){
                date =getDate(name,options.datePrefix,options.dateFormat);
                annotations.date = date;
            }

            const typedAnnotations = typeAnnotations(annotations);
            const nodesById = {[node.id]:node,...descendentNodesById};
            const annotationsById = {[node.id]:annotations,...childNodes.reduce((acc,curr)=>({...acc,...curr.annotationsById}),{})};
            const annotationTypes =[typedAnnotations,...childNodes.map(child=>child.annotationTypes)].reduce((acc,curr)=>{return reconcileAnnotations(curr,acc)},{});
            const cladeMap={[node.clade]:node.id,...childNodes.reduce((acc,curr)=>({...acc,...curr.cladeMap}),{})}
            const externalNodes =[(!node.children?node.id:null),...childNodes.reduce((acc,curr)=>acc.concat(curr.externalNodes),[])].filter(n=>n);
            const internalNodes=[(node.children?node.id:null),...childNodes.reduce((acc,curr)=>acc.concat(curr.internalNodes),[])].filter(n=>n);
            const postOrder=[...childNodes.reduce((acc,curr)=>acc.concat(curr.postOrder),[]),node.id];
            const clades = [...childNodes.reduce((acc,curr)=>acc.concat(curr.clades),[]),node.clade];
            return ({nodesById,annotationsById,annotationTypes,cladeMap,clades,externalNodes,internalNodes,postOrder,root:node.id})

        }
        return newickSubstringParser(newickString);
    }

}

function parseAnnotation(annotationString){
    const exposedCommas=/,(?=(?:(?:(?![\)]).)*[\(])|[^\(\)]*$)(?=(?:(?:(?![\]]).)*[\[])|[^\[\]]*$)(?=(?:(?:(?![\}]).)*[\{])|[^\{\}]*$)/g;
    const setRegex = /\{(.+)\}/;
    // const setRegex = /\{(.+)\}/;
    const out = {};
    for( const annotation of annotationString.split(exposedCommas)){

        let [annotationKey,data] = annotation.split("=");
            annotationKey=annotationKey.replace(".","_");
            if(setRegex.test(data)) {
                data = data.split(setRegex).filter(s => s !== "").reduce((acc,curr)=>acc.concat(curr.split(exposedCommas)),[]);
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
        if(/.+_prob/.test(probabilityKey)){
            const base = probabilityKey.split("_prob").filter(s=>s!=="");
            const traitkey = `${base}_set`;
            const probabilities=[].concat(out[probabilityKey]);
            if(keys.includes(traitkey)) {
                const probabilitySet = {};
                for (let i = 0; i < out[traitkey].length; i++) {
                    probabilitySet[out[traitkey][i]] = probabilities[i];
                    finalObject[`${base}_probSet`] = {...probabilitySet};
                }
            }
        }
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
    if (s.startsWith("\"") || s.startsWith("'")) {
         return s.slice(1);
    }
    return s;
}

function removeEndQuotes(s){
    if (s.endsWith("\"") || s.endsWith("'")) {
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

