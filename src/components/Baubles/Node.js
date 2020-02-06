import React from "react"
import G from "../svgElements/G";


export default function Node(props){
    const {children} = props;
    // children will be set by the main settings and will be things like paths, text, ect. They will
    const {scales} = props;
    const {vertex} =props;

    return(
        <G className={`node ${vertex.classes.join(" ")} `}  transform={`translate(${scales.x(vertex.x)},${scales.y(vertex.y)})`}>
            {children.map(child=>child(props))}
        </G>
    )
}


