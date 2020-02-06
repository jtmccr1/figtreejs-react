import React from "react"
import G from "./svgElements/G";
import Branch from "./Baubles/Branch";
import Node from "./Baubles/Node"
import {scaleLinear} from "d3-scale";
import {extent} from "d3-array";

export default function FigTree(props){
    const {tree,layout,margins,size,branchChildren,nodeChildren} = props;
    const {vertices,edges} = layout(tree);
    const scales=setUpScales(size,margins,vertices,edges);


    return(
        <G transform={`translate(${margins.left},${margins.top})`}>
            <G id={"annotation-layer"}/>
            <G id={"axis-layer"}/>
            <G id={"branches-layer"}>
            ${edges.map(edge=>Branch({edge,scales,children:branchChildren}))}
            </G>
            <G id={"node-backgrounds-layer"}>
            </G>
            <G id={"node-layer"}>
                ${vertices.map(vertex=>Node({vertex,scales,children:nodeChildren,r:5}))}
            </G>
        </G>
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