import React, {useContext,useMemo} from "react"
import {useSpring,animated} from "react-spring";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {NodeContext} from "../../FigTree";

export const NodeShape =(props)=>{
	const {state,dispatch}=useContext(NodeContext);
	const { vertex,attrs,selectedAttrs,hoveredAttrs} =props;
	const baseAttrMapper = useMemo(()=>mapAttrsToProps(attrs),[attrs]);
	const selectedAttrMapper = useMemo(()=>mapAttrsToProps(selectedAttrs),[selectedAttrs]);
	const hoveredAttrMapper = useMemo(()=>mapAttrsToProps(hoveredAttrs),[hoveredAttrs]);

	function attrMapper(v){
		let attrs=baseAttrMapper(v);
		if(state.hovered===v.id){
			attrs={...attrs,...hoveredAttrMapper(v)};
		}
		if(state.selected.includes(v.id)){
			attrs={...attrs,...selectedAttrMapper(v)};
		}
		return attrs;
	}

	let visibleProperties=attrMapper(vertex);
	visibleProperties= useSpring(visibleProperties);

	return (<animated.circle className={"node-shape"} {...visibleProperties}
							 onMouseEnter={()=>dispatch({type:"hover",payload:vertex.id})}
							 onMouseLeave={()=>dispatch({type:"unhover"})}/>);

};


NodeShape.defaultProps={
	attrs:{r:4,
		fill:"steelblue",
		strokeWidth:0,
		stroke:'black'},
	selectedAttrs:{},
	hoveredAttrs:{}
};



export default React.memo(NodeShape);
