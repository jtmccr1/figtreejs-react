import React,{useState,useMemo,useCallback} from 'react';

import {scaleLinear} from "d3-scale";
import {extent} from "d3-array";
import {makeEdge,rectangularVertex} from "../utils/layouts/index";
import Branches from "./Baubles/Branches/Branches";

/**
 * The FigTree component
 * This takes a tree and layout options. It calls the layout and handles state for this figure.
 * It also passes it's scales to it's children props as well as the edges to the branches and the nodes to the nodes.
 */
export default function FigTree(props){

    const {layout,margins,width,height,tree,} = props;

    const vertices = tree.getPostOder().map(id=>layout(id,tree));

    // console.time("vertLoop");
    // let i=0;
    // for(const v of tree.getPostOder()){
    //     i+=tree.getDivergence(v.id);
    // }
    // console.timeEnd("vertLoop");


    const edges =   tree.getPostOder().filter(id=>id!==tree.getRoot()).map(id=>makeEdge(layout)(id,tree));
    const scales=useMemo(()=>{console.log("setting up scales");return setUpScales({width,height},margins,vertices)},[tree]);

     //TODO scales in state so can be updated by legends
    return(
            <g transform={`translate(${margins.left},${margins.top})`}>
                {React.Children.map(props.children, (child, index) => {
                    switch(child.type.name){
                        case "Nodes":
                        return React.cloneElement(child, {
                            vertices,
                            scales,
                        });
                        case "Branches":
                            return React.cloneElement(child, {
                                edges,
                                scales,
                            });
                        case "Axis":
                            return React.cloneElement(child, {
                                scales,
                                width,
                                height,
                                margins,
                            });
                        default:
                            throw new Error(`FigTree component ${child.type.name} not recognized.`)
                    }
                }).reverse()}
            </g>
    )
}
function setUpScales(size,margins,vertices){
    const xdomain = extent(vertices.map(d=>d.x));
    const ydomain =  extent(vertices.map(d=>d.y));

    const x = scaleLinear()
        .domain(xdomain)
        .range([0, size.width - margins.right-margins.left]);

    const y = scaleLinear()
        .domain(ydomain)
        .range([size.height -margins.bottom-margins.top,0]);
    return {x,y};
}

FigTree.defaultProps= {
    width: undefined, /** Width of svg */
    height: undefined,
    layout: rectangularVertex,
    children: [<Branches/>],
    margins:{top:10,bottom:10,left:10,right:10}
}
