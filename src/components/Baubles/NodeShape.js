import React from "react"
import {useSpring,animated} from "react-spring";

export default function NodeShape(props){
	const {shape,vertex,attrs,filter,interactions,tree,...rest}=props;

	// if attr entry is a function call it on the vertex.
	let updatedAttrs={};
	for (const key of Object.keys(attrs)){
		if(attrs[key] && {}.toString.call(attrs[key]) === '[object Function]'){
			updatedAttrs[key]=attrs[key](vertex)
		}else{
			updatedAttrs[key]=attrs[key]
		}
	}

	const updatedInteractions={};
	for (const key of Object.keys(interactions)){
		updatedInteractions[key]=()=>interactions[key](vertex)
	}

	updatedAttrs= useSpring({...updatedAttrs});




	if(filter(vertex)) {

		switch (shape) {
			case "circle":
				return (<animated.circle className={"node-shape"} {...updatedAttrs} {...interactions} {...rest} />);
			case "rect":
				return (<animated.rect className={"node-shape"} {...updatedAttrs}   {...interactions} {...rest} />);
			default:
				throw new Error(`Unknown Node Shape: ${shape}`)
		}
	}
	else{
		return null;
	}
}

NodeShape.defaultProps ={
	filter:()=>true,
	interactions:{},
}
