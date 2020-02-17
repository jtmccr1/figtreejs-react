import {mean} from "d3-array";
import {Type} from "../immutableTree";

export function getVertexClassesFromNode(id,tree){
    let classes = [(!tree.getChildren(id) ? "external-node" : "internal-node")];
    if (tree.tree.annotationTypes) {
        classes=classes.concat(Object.entries(tree.getNodeAnnotations(id))
                .filter(([key]) => {
                    return tree.getAnnotation(key) &&
                        (tree.getAnnotation(key).type === Type.DISCRETE ||
                            tree.getAnnotation(key).type === Type.BOOLEAN ||
                            tree.getAnnotation(key).type === Type.INTEGER);
                })
                .map(([key, value]) =>{
                    if(tree.getAnnotation(key).type===Type.DISCRETE || tree.getAnnotation(key).type === Type.INTEGER){
                        return `${key}-${value}`;
                    }else if(tree.getAnnotation(key).type === Type.BOOLEAN && value ){
                        return `${key}`
                    }
                }));
    }
    return classes;
}

export function makeVertexFromNode(id,tree){
    const leftLabel= !!tree.getChildren(id);
    const labelBelow= (!!tree.getChildren(id) && (!tree.getParent(id) || tree.getChildren(tree.getParent(id))[0] !== id));

    return {
        id:id,
        textLabel:{
            labelBelow:labelBelow,
            x:leftLabel?"-6":"12",
            y:leftLabel?(labelBelow ? "-8": "8" ):"0",
            alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
            textAnchor:leftLabel?"end":"start",
        },
        classes: []//getVertexClassesFromNode(id,tree),
    };
}


export function makeEdges(vertices,tree){
    return vertices.filter(v=>tree.getParent(v.id)).map(v=>{
        const parentVertex=vertices.find(vert=>vert.id===tree.getParent(v.id));
        return {
            v0: parentVertex,
            v1: v,
            id:v.id,
            classes:v.classes,
            x:parentVertex,
            y:v.y,
            textLabel:{
                x:mean([v.x,parentVertex.x]),
                y: -6,
                alignmentBaseline: "bottom",
                textAnchor:"middle",
            },
        }
    })
}

export const layoutFactory=makeVertices=>tree=>{
    const vertices = makeVertices(tree);
    const edges = makeEdges(vertices,tree);
    return {vertices,edges}
};