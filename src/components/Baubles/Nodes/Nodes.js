import React from "react"
import{useSpring,animated} from "react-spring";
import NodeShape from "./NodeShape";

export default function Nodes(props){

 return(
     <g className={"node-layer"}>
         {props.children}
     </g>
 )

}

