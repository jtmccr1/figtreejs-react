import React from "react"
import {useSpring,animated} from "react-spring";

export const NodeShape =(props)=>{
	props= useSpring(props);
	return (<animated.circle className={"node-shape"} {...props} />);

}



NodeShape.defaultProps={
	r:4,
	fill:"steelblue",
};

export default React.memo(NodeShape);
