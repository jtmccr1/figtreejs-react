import React, {useMemo,useState,useCallback} from "react"
import NodeShape from "./NodeShape";
import Node from "./Node";
import {applyInteractions, mapAttrsToProps} from "../../../utils/baubleHelpers";

export default function Nodes(props){

    const {labelOnHover,highlightOnHover,
        vertices,filter,scales,attrs,
        labelAttrs, labelMaker,interactions}=props;
    //I am assuming if the user wants to apply attributes based on what is hovered or seleted they
    // they have access to that. highlighONHover is a nice short cut but for the moment I don't need to
    // focus on handeling all that.
    //hooks?
    const attrMapper = mapAttrsToProps(attrs);
    const labelAttrMapper = mapAttrsToProps(labelAttrs)
    const hoverAttrMapper = highlightOnHover && mapAttrsToProps(highlightOnHover);
    const appliedInteractions = applyInteractions(interactions);
    // refactor so OnHover prop is a function that fires on hover. same for onClick. the lift to hoc so can use in multiple components
    // Highlight on Hover is built in option that takes an attr like object to be applied to the hovered node.
    // If part of a figure, and  the hovered node state and updater will be lifted come from the figure. This way they will
    // be shared by all subfigures.


    const [hoveredNode,hoverNode] =props.hoverNode?[props.hoveredNode,props.hoverNode]: useState("");
    const hoverer = useCallback((id) =>({onMouseEnter:()=>hoverNode(id),onMouseLeave:()=>hoverNode("")}),[hoverNode]);
    const [selectedNodes,selectNode] =props.selectNode?[props.selectedNodes,props.selectNode]: useState(""); // use reducer so can add with command ro just select
    const selector = useCallback((id) =>({onMouseEnter:()=>hoverNode(id),onMouseLeave:()=>hoverNode("")}),[hoverNode]);

 return(
     <g className={props.className}>
         {vertices.reduce((all,v)=>{
             if(filter(v)){
                 all.push( <Node key={`node-${v.id}`} classes={v.classes.concat((v.id===hoveredNode?"hovered":[]))} x={scales.x(v.x)} y={scales.y(v.y)}  interactions={{...hoverer(v.id),...appliedInteractions(v)}} >
                     <NodeShape {...attrMapper(v)} {...((highlightOnHover&&v.id===hoveredNode)&&hoverAttrMapper(v))} />
                 </Node>)
             }
             return all;
         },[])}
     </g>
 )
}

Nodes.defaultProps={
    labelMaker:(v)=>v.id,
    labelAttrs:{},
    labelOnHover:false, // only show label on hover
    filter:(v)=>true,
    highlightOnHover:{},
    onClick:{},
    attrs:{},
    vertices:[],
    className:"node-layer",
    interactions:{},
};

function Hoverer(callback){
    return function(state){
        return {onMouseEnter:()=>callback(state),onMouseLeave:()=>callback("")}
    }

}
