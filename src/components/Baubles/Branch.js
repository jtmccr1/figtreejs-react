import React from "react"
import G from "../svgElements/G";
import {curveStepBefore, line} from "d3-shape";
import {useSpring} from "react-spring";


export default function Branch(props){

    const{edge}=props;
    const {children} = props;
    // children will be set by the main settings and will be things like paths, text, ect. They will
    const {scales} = props;



    return(
        <G key={edge.key} className={`branch ${edge.classes.join(" ")} `}  transform={`translate(${scales.x(edge.x)},${scales.y(edge.y)})`}>
            {children.map(child=>child(props))}
        </G>
    )
}


