import React from "react"
import{useSpring,animated} from "react-spring";

export default function Node(props){
    // children will be set by the main settings and will be things like paths, text, ect. They will
    const {scales} = props;
    const {vertex} =props;
    const position = useSpring({transform:`translate(${scales.x(vertex.x)},${scales.y(vertex.y)})`});
 return(
        <animated.g className={`node ${vertex.classes.join(" ")} `} {...position}>
            {props.children}
        </animated.g>
    )
}


