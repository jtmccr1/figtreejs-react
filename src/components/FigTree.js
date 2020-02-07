import React from 'react';
import Branches from "./Baubles/Branches";
import {scaleLinear} from "d3-scale";
import {extent} from "d3-array";


export default function FigTree(props){
    const {layout,margins,width,height,tree} = props;

    const {vertices,edges} = layout(tree);
    const scales=setUpScales({width,height},margins,vertices,edges);

    return(
        <svg width={width} height={height} > // make own component with defaults
            <g transform={`translate(${margins.left},${margins.top})`}>
                {React.Children.map(props.children, (child, index) => {
                    switch(child.type.name){
                        case "Nodes":
                        return React.cloneElement(child, {
                            vertices,
                            scales
                        });
                        case "Branches":
                            return React.cloneElement(child, {
                                edges,
                                scales
                            });
                        case "Axis":
                            return React.cloneElement(child, {
                                scales
                            });
                        default:
                            throw new Error(`FigTree component ${child.type.name} not recognized.`)
                    }

                }).reverse()}
            </g>
        </svg>
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