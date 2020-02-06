import React, { useState } from 'react';
import Branch from "./Baubles/Branch";
import BranchPath from "./Baubles/BranchPath"
import Node from "./Baubles/Node"
import NodeShape from "./Baubles/NodeShape"
import {scaleLinear} from "d3-scale";
import {extent} from "d3-array";


export default function FigTree(props){
    const {layout,margins,size,tree} = props;

    const [update,updateUpdate] =useState(0); // hack of the century until tree becomes immutable
    const [hovered,updateHovered] = useState([]);
    const {vertices,edges} = layout(tree);
    const scales=setUpScales(size,margins,vertices,edges);

    return(
        <g transform={`translate(${margins.left},${margins.top})`}>
            <g id={"annotation-layer"}/>
            <g id={"axis-layer"}/>
            <g id={"branches-layer"}>
            {edges.map(edge=>{
                return (
                        <Branch key = {edge.id} edge={edge} scales={scales}>
                            <BranchPath scales={scales} edge={edge}/>
                        </Branch>)}
                        )}
            </g>
            <g id={"node-backgrounds-layer"}>
            </g>
            <g id={"node-layer"}>
                {vertices.map(vertex=> {
                   return( <Node key={vertex.key}{...{vertex,scales}}>
                        <NodeShape shape={"circle"} styles={{r:(hovered.includes(vertex.id)?6:4)}} // make it's own component so it can handle transitions
                                onClick={()=>{tree.rotate(vertex.node);console.log("rotate");updateUpdate(update+1)}}
                        onMouseEnter={()=>updateHovered(hovered.concat(vertex.id))}
                        onMouseLeave={()=>updateHovered(hovered.filter(id=>id!==vertex.id))}/>
                    </Node>);
                        }
                  )}
            </g>
        </g>
    )
}
function setUpScales(size,margins,vertices,edges){
    const xdomain = extent(vertices.map(d=>d.x).concat(edges.reduce((acc,e)=> acc.concat([e.v1.x,e.v0.x]),[])));
    // almost always the same except when the trendline is added as an edge without vertices
    const ydomain =  extent(vertices.map(d=>d.y).concat(edges.reduce((acc,e)=>acc.concat([e.v1.y,e.v0.y]),[])));

    const x = scaleLinear()
        .domain(xdomain)
        .range([0, size.width - margins.right-margins.left]);

    const y = scaleLinear()
        .domain(ydomain)
        .range([size.height -margins.bottom-margins.top,0]);
    return {x,y};
}