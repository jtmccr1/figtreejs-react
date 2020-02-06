import React from "react"
import {useSpring,animated} from "react-spring";

export default function Branch(props){
    const{edge}=props;
    const {scales} = props;

    const position = useSpring({transform:`translate(${scales.x(edge.x)},${scales.y(edge.y)})`});

    return(
        <animated.g key={edge.key} className={`branch ${edge.classes.join(" ")}`} {...position}>
            {props.children}
        </animated.g>
    )
}


