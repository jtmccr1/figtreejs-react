import React from "react"
import {useSpring,animated} from "react-spring";

export const NodeShape =(props)=>{

	props= useSpring(props);

	return (<animated.circle className={"node-shape"} {...props} />);

}



NodeShape.defaultProps={
	r:4,
	fill:"steelblue",
}

function sameAttrs(prev,incoming){
	const {interactions,...attrs} = prev;
	const {newInteractions,...newAttrs} = incoming;


}
export default React.memo(NodeShape);