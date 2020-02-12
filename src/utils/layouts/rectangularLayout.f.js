import {mean} from "d3-array";
import {makeEdges, makeVertexFromNode} from "./layoutHelpers";


/*class rectangularLayout{

    constructor(tree){
        this.tree=tree
    }

    getY(){
        const self =this;
        const cache = {};
        return (function f(id) {
            let value;
            if (id in cache) {
                value = cache[id];
            } else {
                value = this.tree.getChildren(id)?mean(this.tree.getChildren(id).map(child=>self.getY(child))):this.tree.externalNodes().indexOf(id);
                cache[id] = value;
            }
            return value;
        })(id)
    }
    getX(){
        const self =this;
        const cache = {};
        return (function f(id) {
            let value;
            if (id in cache) {
                value = cache[id];
            } else {
                value = this.tree.getDivergence(id);
                cache[id] = value;
            }
            return value;
        })(id)
    }


}*/



export function rectangularVertices(tree){
    let currentY=-1;
    const vertexMap={};

    return tree.getPostOder().map(id=>{
        const v ={...makeVertexFromNode(tree.getNode(id),tree),
            x:tree.getDivergence(id),
            y:tree.getChildren(id)?mean(tree.getChildren(id).map(child=>vertexMap[child].y)):(currentY+=1)
        };
        vertexMap[id]=v;
        return v
    });

}


const layoutFactory=makeVertices=>tree=>{
    const vertices = makeVertices(tree);
    const edges = makeEdges(vertices,tree);
    return {vertices,edges}
};

export const rectangularLayout = layoutFactory(rectangularVertices);