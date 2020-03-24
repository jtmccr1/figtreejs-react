import React, {useContext,useMemo} from "react"
import {useSpring,animated} from "react-spring";

export const AnimatedCircle = React.memo( (props)=>{
   const {attrs,interactions,tooltip,x:cx,y:cy} = props;
    const visibleProperties= useSpring({...attrs,cx,cy});
    return (
    	<animated.circle {...tooltip}  className={"node-shape"} {...visibleProperties} {...interactions}/>
    	);
},sameAttributes);


export const Circle = React.memo( (props)=>{
	const {attrs,interactions,tooltip,x:cx,y:cy} = props;
	return (
		<circle {...tooltip}  className={"node-shape"} {...attrs} cx={cx} cy={cy} {...interactions}/>
	);
},sameAttributes);
AnimatedCircle.defaultProps={
	attrs:{r:4,
		fill:"steelblue",
		strokeWidth:0,
		stroke:'black'},
};
export function sameAttributes(prev,curr){
	for(const [key,val] of Object.entries(prev.attrs)){
		if(curr.attrs[key]!==val){
			return false
		}
	}
	if("cy" in prev){
		return prev.cx===curr.cx&&prev.cy===curr.cy;
	}
	return true;
}
