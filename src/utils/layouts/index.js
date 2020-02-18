import {makeVertexFromNode} from "./layoutHelpers";
import {mean} from "d3-array";

export function rectangularVertex(id,tree){
    let cache={};
    return (function rectangularVertexHelper(id,tree){
        if(id in cache){
            return cache[id];
        }else{
            const vertex = makeVertexFromNode(id,tree);
            vertex.x = tree.getDivergence(id);
            if(tree.getChildren(id)){
                vertex.y = mean(tree.getChildren(id).map(child=>rectangularVertexHelper(child,tree).y));
            }else{
                vertex.y = tree.getExternalNodes().indexOf(id);
            }
            cache[id]=vertex;
            return vertex;
        }
    })(id,tree)
}


export function makeEdge(vertexLayout) {
    return function (id, tree) {
        const vertex = vertexLayout(id, tree);
        const parentVertex = vertexLayout(tree.getParent(id), tree);
        return {
            v0: parentVertex,
            v1: vertex,
            id: id,
            classes: vertex.classes,
            x: parentVertex.x,
            y: vertex.y,
            textLabel: {
                x: mean([vertex.x, parentVertex.x]),
                y: -6,
                alignmentBaseline: "bottom",
                textAnchor: "middle",
            }
        }
    }
};