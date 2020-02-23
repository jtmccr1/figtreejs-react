import {ImmutableTree, reconcileAnnotations} from "./Tree/immutableTree";

export default class ImmutableCladeCollection {
    constructor(collection) {
        this.collection=collection;
    }

    static parseNexus(string,options){
        const trees= ImmutableTree.parseNexus(nexus,options={});
        return ImmutableCladeCollection.collectTrees(trees);
    }

    static collectTrees(trees){
        return trees.reduce((collection,tree)=>treeReducer(tree,collection),{})
    }
}

export function treeReducer(tree,collection={}){
    const clades = collection.clades?collection.clades.concat(tree.clades.filter(c=>!collection.clades.includes(c))):tree.clades;
    const annotationTypes =collection.annotationTypes?reconcileAnnotations(tree.annotationTypes,collection.annotationTypes):tree.annotationTypes;

    const treeClades = tree.clades.reduce((acc,clade)=>({...acc,[clade]:cladeMaker(tree,clade)}),{});

    const cladesById= collection.cladesById?mergeClades(collection.cladesById,treeClades):treeClades;

    return {cladesById,annotationTypes,clades}

}

function cladeMaker(tree,clade){
     const node = tree.nodesById[tree.cladeMap[clade]];
     const annotations = tree.annotationsById[tree.cladeMap[clade]];
     const cladeAnnotations = {...Object.keys(annotations).reduce((acc,curr)=>({...acc,[curr]:[annotations[curr]]}),{}),count:1}
    if(node.length){
       cladeAnnotations.length=[node.length];
    }
    return cladeAnnotations;
}
function mergeClades(clades1,clades2){
    const clades1Keys = Object.keys(clades1);
    const clades2Keys = Object.keys(clades2);
    const matchingClades = clades1Keys.filter(c=>clades2Keys.includes(c));

    return {...clades1,...clades2,...matchingClades.reduce((acc,key)=>({...acc,[key]:mergeClade(clades1[key],clades2[key])}),{})}

}
export function mergeClade(clade1,clade2){
    const clade1Keys = Object.keys(clade1);
    const clade2Keys = Object.keys(clade2);
    const samekeys =  clade1Keys.filter(key=>!clade2Keys.includes(key)).concat(clade2Keys.filter(key=>!clade1Keys.includes(key))).length===0;
    if(!samekeys){
        console.log(clade1);
        console.log(clade2);
        throw new Error("Unmatched keys between trees! check console for ")
    }

    return Object.assign(clade1Keys.filter(key=>key!=="count")
            .reduce((acc,key)=>({...acc,[key]:clade1[key].concat(clade2[key])}),{...clade1}),
        {count:clade1.count+clade2.count})
}