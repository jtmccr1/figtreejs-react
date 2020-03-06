import React, {useContext,useMemo} from "react"
import {useSpring,animated} from "react-spring";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {LayoutContext, NodeContext, ScaleContext} from "../../FigTree";
import {linkHorizontal} from "d3-shape";
import {max,min} from "d3-array";




export default function CoalescentNode(props){
    //HOC for node logic
    const {state,dispatch}=useContext(NodeContext);
    const {vertices} =  useContext(LayoutContext);
    const scales = useContext(ScaleContext);

    const {vertex,attrs,selectedAttrs,hoveredAttrs} =props;
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

    const targets = vertex.node.children.map(child=>vertices.get(child));

    const d=makeCoalescent(vertex,targets,scales);
    let visibleProperties=attrMapper(vertex);
    visibleProperties= useSpring(visibleProperties);


    return (<animated.path className={"node-shape"} d={d}{...visibleProperties}
                             onMouseEnter={()=>dispatch({type:"hover",payload:vertex.id})}
                             onMouseLeave={()=>dispatch({type:"unhover"})}
                             onClick={()=>selectorLogic(state.selected,dispatch,vertex.id)}/>);

};


CoalescentNode.defaultProps={
    attrs:{
        fill:"steelblue",
        strokeWidth:1,
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
const link = linkHorizontal()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });
//link({source:{x:50,y:50},target:{x:90,y:10}})+"v80"+link({source:{x:90,y:90},target:{x:50,y:50}})
function makeCoalescent(vertex,targets,scales,slope=2){
    const x=scales.x(min(targets,d=>d.x)-vertex.x);
    const y1=-scales.y((0.4+vertex.y-min(targets,d=>d.y)));
    const y2 = scales.y(max(targets,d=>d.y)-vertex.y+0.4);

    const topD=link({source:{x:0,y:0},target:{x:x/slope,y:y1}});
    const linker=`L${x},${y1}v${y2-y1}L${x/slope},${y2}`;
    // const linker=`v${y2-y1}`;

    const bottomD=link({source:{x:x/slope,y:y2},target:{x:0,y:0}});
return topD+linker+bottomD;

}
