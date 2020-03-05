import React, {useContext,useMemo} from "react"
import {useSpring,animated} from "react-spring";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {NodeContext} from "../../FigTree";
import {linkHorizontal} from "d3-shape";

const link = linkHorizontal()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });
//link({source:{x:50,y:50},target:{x:90,y:10}})+"v80"+link({source:{x:90,y:90},target:{x:50,y:50}})
export const CoalesenctNode =(props)=>{
    //HOC for node logic
    const {state,dispatch}=useContext(NodeContext);

    const {vertex,targets,attrs,selectedAttrs,hoveredAttrs} =props;
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
    };


    const xs=extent(targets,d=>d.x);
    const ys=extent(targets,d=>d.y);

    target


    let visibleProperties=attrMapper(vertex);
    visibleProperties= useSpring(visibleProperties);


    return (<animated.path className={"node-shape"} {...visibleProperties}
                             onMouseEnter={()=>dispatch({type:"hover",payload:vertex.id})}
                             onMouseLeave={()=>dispatch({type:"unhover"})}
                             onClick={()=>selectorLogic(state.selected,dispatch,vertex.id)}/>);

};


CoalesenctNode.defaultProps={
    attrs:{
        fill:"steelblue",
        strokeWidth:0,
        stroke:'black'},
    selectedAttrs:{},
    hoveredAttrs:{}
};

function selectorLogic(selection,dispatcher,vertexId){
    if(selection.length===1&&selection[0]===vertexId){

        dispatcher({type:"clearSelection"})
    }else{
        dispatcher({type:"select",payload:vertexId})
    }
}


