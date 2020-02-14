import React, {useMemo,useState,useCallback} from "react"
import NodeShape from "./NodeShape";
import Node from "./Node";
import {mapAttrsToProps} from "../helpers";

export default function Nodes(props){

    const {label,curvature,onHover,OnClick,vertices,filter,scales,attrs}=props;
    const attrMapper = mapAttrsToProps(attrs);
    const [hoveredNode,HoverNode] = useState("");
    const hoverer = (id) =>({onMouseEnter:()=>HoverNode(id),onMouseLeave:()=>HoverNode("")})


 return(
     <g className={"node-layer"}>
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
};

function Hoverer(callback){
    return function(state){
        return {onMouseEnter:()=>callback(state),onMouseLeave:()=>callback("")}
    }

}
