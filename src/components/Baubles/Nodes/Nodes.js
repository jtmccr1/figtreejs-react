import React, {useMemo,useState,useCallback} from "react"
import NodeShape from "./NodeShape";
import Node from "./Node";
import {mapAttrsToProps} from "../helpers";

export default function Nodes(props){
//TODO make
    const {label,curvature,onHover,OnClick,vertices,filter,scales,attrs}=props;
    const attrMapper = mapAttrsToProps(attrs);

    //Allows for optional self control and lifted state. Maybe context better for these.
    //TODO lift to HOC

    // Make so that onHover can be a function that is passed in as well as selectNode
    // maybe selectNode is a option for OnClick.
    const [hoveredNode,hoverNode] =props.hoverNode?[props.hoveredNode,props.hoverNode]: useState("");
    const hoverer = useCallback((id) =>({onMouseEnter:()=>hoverNode(id),onMouseLeave:()=>hoverNode("")}),[hoverNode]);

    const [selectedNode,selectNode] =props.selectNode?[props.selectedNode,props.selectNode]: useState("");
    const selector = useCallback((id) =>({onMouseEnter:()=>hoverNode(id),onMouseLeave:()=>hoverNode("")}),[hoverNode]);

 return(
     <g className={props.className}>
         {vertices.filter(filter).map(v=>{
             return (
                 <Node key={`node-${v.id}`} classes={v.classes} x={scales.x(v.x)} y={scales.y(v.y)}  interactions={(hoverer(v.id))} >
                     <NodeShape {...attrMapper(v)} {...(v.id===hoveredNode&&onHover)}  />
                 </Node>
             )
         })}
     </g>
 )
}

Nodes.defaultProps={
    label:{},
    filter:(v)=>true,
    onHover:{},
    onClick:{},
    attrs:{},
    vertices:[],
    className:"node-layer"
};

function Hoverer(callback){
    return function(state){
        return {onMouseEnter:()=>callback(state),onMouseLeave:()=>callback("")}
    }

}
