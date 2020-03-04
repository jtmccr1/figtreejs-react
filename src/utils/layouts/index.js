import {makeVertexFromNode} from "./layoutHelpers";
import {mean,max} from "d3-array";
import { getNodes} from "../Tree/treeSettersandGetters";


export const rectangularLayout=(function() {
    const cache = new Map();

    return function rectangularLayout(tree, labelBelow = false) {
        if (!cache.has(tree)) {
            cache.set(tree, new Map())
        }
        if (cache.has(tree) && cache.get(tree).has(labelBelow)) {
            return cache.get(tree).get(labelBelow)
        }
        if (tree.children === null) {
            const vertex = makeVertexFromNode(tree, labelBelow);
            vertex.x = 0;
            vertex.y = 0;
            const output = {vertices:[vertex],edges:[]};
            cache.get(tree).set(labelBelow,output);
            return output;
        } else {
            const childrenLayouts = tree.children.map((child, i) => rectangularLayout(child, i));
            let i = 0;
            for (const childLayout of childrenLayouts) {
                childLayout.vertices.forEach(v=>v.x+=tree.children[i].length);
                childLayout.edges.forEach(e=>e.x+=tree.children[i].length);
                if (i > 0) {
                    const maxY = max(childrenLayouts[i-1].vertices, v => v.y) + 1;
                    childLayout.vertices.forEach(vertex => vertex.y += maxY);
                    childLayout.edges.forEach(e=>e.y+=maxY);
                }
                i += 1;
            }
            const y = mean(childrenLayouts.map(l=>l.vertices), d => d.slice(-1)[0].y);
            const vertex = makeVertexFromNode(tree, labelBelow);
            vertex.y = y;
            vertex.x = 0;
            const newEdges = childrenLayouts.map(l=>makeEdge(vertex,l.vertices.slice(-1)[0]))

            const vertices = childrenLayouts.reduce((acc, curr) => acc.concat(curr.vertices), []);
            vertices.push(vertex);
            const edges =childrenLayouts.reduce((acc, curr) => acc.concat(curr.edges), newEdges);
            const output = {vertices,edges};
            cache.get(tree).set(labelBelow,output);
            return output
        }
    }
}());



export function edgeFactory(vertexLayout) {

    function makeEdges (tree) {
        if(tree.children===null){
            return
        }
        const vertices = [...vertexLayout(tree)];
        const nodes = getNodes(tree);
        let currentSource = vertices.pop();
        let currentTarget = vertices.pop();

        const childrenMap=new Map(nodes.map(n=>[n.id,(n.children?n.children.length:0)]));
        const deque=[];
        const edges =[];
        while(edges.length<nodes.length-1){
            edges.push(makeEdge(currentSource,currentTarget));

            childrenMap.set(currentSource.id,childrenMap.get(currentSource.id)-1);

            if(childrenMap.get(currentTarget.id)){
                deque.push(currentSource);
                currentSource=currentTarget;
                currentTarget=vertices.pop();
            }else if(childrenMap.get(currentSource.id)){
                currentTarget=vertices.pop();
            }else{
                currentTarget=vertices.pop();
                currentSource=deque.pop();
            }
        }
        return edges;

    };
    return makeEdges
};

function  makeEdge(source,target){
    return {
        v0: source,
        v1: target,
        id: target.id,
        classes: target.classes,
        x: source.x,
        y: target.y,
        textLabel: {
            x: mean([target.x, source.x]),
            y: -6,
            alignmentBaseline: "bottom",
            textAnchor: "middle",
        }
    }
}