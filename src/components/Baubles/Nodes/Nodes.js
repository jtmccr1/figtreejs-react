import React, {useMemo, useState, useCallback, useContext} from "react"
import NodeShape from "./NodeShape";
import Node from "./Node";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {ScaleContext} from "../../FigTree";
import {reduceIterator} from "../../../utils/utilities";


export default function Nodes(props){
    const scales = useContext(ScaleContext);

    const { filter,vertices,className} =props;

 return(
     <g className={className}>
         {reduceIterator(vertices.values(),(all,v)=>{
             if(filter(v)){
                 all.push( <Node key={`node-${v.id}`} classes={v.classes} x={scales.x(v.x)} y={scales.y(v.y)}>
                     {/*<NodeShape vertex={v} />*/}
                     {React.Children.map(props.children, child=>React.cloneElement(child,{vertex:v}))}
                     {/*//TODO make this a render prop for different bauble types*/}
                     {/*//TODO add lable render prop for node lable*/}
                 </Node>)
             }
             return all;
         },[])}
     </g>
 )
}

Nodes.defaultProps={
    filter:(v)=>true,
    vertices:[],
    children:[<NodeShape/>],
    className:"node-layer",
};



function selectorLogic(selection,dispatcher,vertexId){
    if(selection.length===1&&selection[0]===vertexId){

        dispatcher({type:"clearSelection"})
    }else{
        dispatcher({type:"select",payload:vertexId})
    }
}
// Nested renders for selected and hovered nodes