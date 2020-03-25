import React,{useMemo,useReducer} from 'react';

import {scaleLinear} from "d3-scale";
import {extent} from "../../utils/utilities";
import Branches from "./Baubles/Branches/Branches";
import {makeEdges, rectangularVertices} from "../../utils/layouts";
import {getDateRange} from "../../utils/Tree/treeSettersandGetters";
import {ScaleContext,TreeContext,LayoutContext} from "../../Context/Context";
import withConditionalInteractionProvider from "../HOC/withConditionalInteractionProvider.js"
/**
 * The FigTree component
 * This takes a tree and layout options. It calls the layout and handles state for this figure.
 * It also passes it's scales to it's children props as well as the edges to the branches and the nodes to the nodes.
 */


function FigTree(props){
    const {layout,width,height,data:tree,pos} = props;
    const vertices = useMemo(()=>layout(tree),[tree]);
    const edges = useMemo(()=>makeEdges(vertices),[vertices]);
    const scales=useMemo(()=>{return setUpScales(width,height,vertices)},[tree]);

    return (
        <ScaleContext.Provider value={{scales,width,height}}>
                <TreeContext.Provider value={tree}>
                    <LayoutContext.Provider value={{vertices:vertices,edges:edges}}>
                        {/*<rect x="0" y="0" width="100%" height="100%" fill="none" pointerEvents={"visible"} onClick={()=>nodeDispatch({type:"clearSelection"})}/>*/}
                        <g transform={`translate(${pos.x},${pos.y})`}>
                            {props.children}
                        </g>
                    </LayoutContext.Provider>
                </TreeContext.Provider>
        </ScaleContext.Provider>
            )
}

export default withConditionalInteractionProvider(FigTree);

function setUpScales(width,height,vertices){
    const xdomain = extent(vertices.values(),d=>d.x);
    const ydomain =  extent(vertices.values(),d=>d.y);
    // padding
        ydomain[0]-=1;
        ydomain[1]+=1;

    const x = scaleLinear()
        .domain(xdomain)
        .range([0, width]);

    const y = scaleLinear()
        .domain(ydomain)
        .range([0,height]);
    return {x,y};
}

FigTree.defaultProps= {
    width: undefined, /** Width of component */
    height: undefined,
    layout: rectangularVertices,
    children: [Branches],
    pos:{x:10,y:10},
    getDateExtent:(tree)=>getDateRange(tree),
};

function childReducer(acc,child){
    const childName=child.type.name;
    console.log(childName);
    switch(childName){
        case "Nodes":
            acc["Nodes"].push(child);
            break;
        case "Branches":
            acc["Branches"].push(child);
            break;
        case "Axis":
            acc["Axis"].push(child);
            break;
        default:
            acc["Other"].push(child);

    }
    return acc;

}