import React from "react"
import {useSpring,animated} from "react-spring";

export default function NodeShape(props){
	let {shape,styles,...rest}=props;
	styles= useSpring({...styles});

	switch(shape){
		case "circle":
			return( <animated.circle className={"node-shape"} {...styles} {...rest} />);
		case "rect":
			return( <animated.rect className={"node-shape"} {...styles} {...rest} />);
		default:
			throw new Error(`Unknown Node Shape: ${shape}`)

	}
}
