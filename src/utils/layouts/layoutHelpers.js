import {mean} from "d3-array";
import {Type} from "../Tree/immutableTree";

export function getVertexClassesFromNode(tree){
    let classes = [(!tree.children ? "external-node" : "internal-node")];
    if (tree.annotationTypes) {
        classes=classes.concat(Object.entries(tree.annotationTypes)
                .filter(([key]) => {
                    return tree.annotationTypes[key] &&
                        (tree.annotationTypes[key].type === Type.DISCRETE ||
                            tree.annotationTypes[key].type === Type.BOOLEAN ||
                            tree.annotationTypes[key].type === Type.INTEGER);
                })
                .map(([key, value]) =>{
                    if(tree.annotationTypes[key].type===Type.DISCRETE || tree.annotationTypes[key].type === Type.INTEGER){
                        return `${key}-${tree.annotations[key]}`;
                    }else if(tree.annotationTypes[key].type === Type.BOOLEAN && tree.annotations[key] ){
                        return `${key}`
                    }
                }));
    }
    return classes;
}

export function makeVertexFromNode(node,labelBelow){
    const leftLabel= !!node.children;

    return {
        id:node.id,
        textLabel:{
            labelBelow:labelBelow,
            x:leftLabel?"-6":"12",
            y:leftLabel?(labelBelow ? "-8": "8" ):"0",
            alignmentBaseline: leftLabel?(labelBelow ? "bottom": "hanging" ):"middle",
            textAnchor:leftLabel?"end":"start",
        },
        classes: getVertexClassesFromNode(node)
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