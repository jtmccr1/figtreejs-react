import React from "react"
import {useSpring,animated} from "react-spring";

const Circle =(props)=>{
   const {attrs,interactions,tooltip} = props;

    const visibleProperties= useSpring(attrs);

    return (
    	<animated.circle {...tooltip} className={"node-shape"} {...visibleProperties} {...interactions}/>
    	);
};

Circle.defaultProps={
	attrs:{r:4,
		fill:"steelblue",
		strokeWidth:0,
		stroke:'black'},
};
export default React.memo(Circle,sameAttributes);
export function sameAttributes(prev,curr){
	for(const [key,val] of Object.entries(prev.attrs)){
		if(curr.attrs[key]!==val){
			return false
		}
	}
	return true

}
