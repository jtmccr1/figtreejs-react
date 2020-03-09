import React,{useMemo,useReducer} from 'react';

import {scaleLinear} from "d3-scale";
import {extent} from "../utils/utilities";
import Branches from "./Baubles/Branches/Branches";
import {makeEdges, rectangularVertices} from "../utils/layouts";
import {nodeReducer} from "../reducers/interactionReducer";
import {parseNewick} from "../utils/Tree/treeOperations";

/**
 * The FigTree component
 * This takes a tree and layout options. It calls the layout and handles state for this figure.
 * It also passes it's scales to it's children props as well as the edges to the branches and the nodes to the nodes.
 */
const  initialState ={hovered:null,selected:[]};

export const ScaleContext = React.createContext(
    {scales:{x:scaleLinear().domain([0,100]).range([0,230]),y:scaleLinear().domain([0,100]).range([0,240])},
        width:300,height:300,margins:{top:10,bottom:50,left:60,right:20}
    });
export const NodeContext = React.createContext({nodeState:initialState,dispatch:nodeReducer});
export const TreeContext = React.createContext(parseNewick(    '((((((virus1:0.1,virus2:0.12)0.95:0.08,(virus3:0.011,virus4:0.0087)1.0:0.15)0.65:0.03,virus5:0.21)1.0:0.2,(virus6:0.45,virus7:0.4)0.51:0.02)1.0:0.1,virus8:0.4)1.0:0.1,(virus9:0.04,virus10:0.03)1.0:0.6);'));
export const LayoutContext = React.createContext({vertices:new Map(),edges:[]});

export default function FigTree(props){

    const {layout,margins,width,height,tree} = props;
    const [NodeState,nodeDispatch]=useReducer(nodeReducer,initialState);
    const vertices = useMemo(()=>layout(tree),[tree]);
    const edges = useMemo(()=>makeEdges(vertices),[vertices]);
    const scales=useMemo(()=>{return setUpScales({width,height},margins,vertices)},[tree]);

    return (
        <ScaleContext.Provider value={{scales,width,height,margins}}>
            <NodeContext.Provider value={{state:NodeState,dispatch:nodeDispatch}}>
                <TreeContext.Provider value={tree}>
                    <LayoutContext.Provider value={{vertices:vertices,edges:edges}}>
                        {/*<rect x="0" y="0" width="100%" height="100%" fill="none" pointerEvents={"visible"} onClick={()=>nodeDispatch({type:"clearSelection"})}/>*/}
                        <g transform={`translate(${margins.left},${margins.top})`}>
                            {/*TODO add layers and portals*/}
                            {React.Children.toArray(props.children).reverse()}
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
