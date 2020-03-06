import React,{useMemo,useReducer} from 'react';

import {scaleLinear} from "d3-scale";
import {extent} from "../utils/utilities";
import Branches from "./Baubles/Branches/Branches";
import {makeEdges, rectangularVertices} from "../utils/layouts";
import {nodeReducer} from "../reducers/interactionReducer";

/**
 * The FigTree component
 * This takes a tree and layout options. It calls the layout and handles state for this figure.
 * It also passes it's scales to it's children props as well as the edges to the branches and the nodes to the nodes.
 */
const  initialState ={hovered:null,selected:[]};

export const ScaleContext = React.createContext({x:(x)=>x});
export const NodeContext = React.createContext("a");
export const TreeContext = React.createContext("a");
export const LayoutContext = React.createContext({vertices:new Map(),edges:[]});
export default function FigTree(props){

    const {layout,margins,width,height,tree} = props;
    const [NodeState,nodeDispatch]=useReducer(nodeReducer,initialState);
    const vertices = layout(tree);
    const edges = makeEdges(vertices);

    const scales=useMemo(()=>{console.log("setting up scales");return setUpScales({width,height},margins,vertices)},[tree]);

    return (
        <ScaleContext.Provider value={scales}>
            <NodeContext.Provider value={{state:NodeState,dispatch:nodeDispatch}}>
                <TreeContext.Provider value={tree}>
                    <LayoutContext.Provider value={{vertices:vertices,edges:edges}}>

            <rect x="0" y="0" width="100%" height="100%" fill="none" pointerEvents={"visible"} onClick={()=>nodeDispatch({type:"clearSelection"})}/>
            <g transform={`translate(${margins.left},${margins.top})`}>
                {React.Children.map(props.children, (child, index) => {
                    switch(child.type.name){
                        case "Axis":
                            return React.cloneElement(child, {
                                width,
                                height,
                                margins,
                            });
                        default:
                           return child;
                    }
                }).reverse()}
            </g>
                </LayoutContext.Provider>
                </TreeContext.Provider>
            </NodeContext.Provider>
            </ScaleContext.Provider>

            )
}
function setUpScales(size,margins,vertices){
    const xdomain = extent(vertices.values(),d=>d.x);
    const ydomain =  extent(vertices.values(),d=>d.y);

    const x = scaleLinear()
        .domain(xdomain)
        .range([0, size.width - margins.right-margins.left]);

    const y = scaleLinear()
        .domain(ydomain)
        .range([0,size.height -margins.bottom-margins.top]);
    return {x,y};
}

FigTree.defaultProps= {
    width: undefined, /** Width of svg */
    height: undefined,
    layout: rectangularVertices,
    children: [<Branches/>],
    margins:{top:10,bottom:10,left:10,right:10}
}
