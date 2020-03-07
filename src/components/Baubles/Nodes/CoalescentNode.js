import React, {useContext, useMemo} from "react"
import {animated, useSpring} from "react-spring";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {LayoutContext, NodeContext, ScaleContext} from "../../FigTree";
import {linkHorizontal} from "d3-shape";
import {max, min} from "d3-array";
import withLinearGradient from "../../HOC/WithLinearGradient";
//TODO make edges from vertices
/*
TODO unify edge and vertex opacity edge gradients can get this from where the last point is
 */

const basicCalescentNode=(props)=>{
    //HOC for node logic
    const {vertices} =  useContext(LayoutContext);
    const {scales} = useContext(ScaleContext);

    const {vertex,attrs} =props;
    const baseAttrMapper = useMemo(()=>mapAttrsToProps(attrs),[attrs]);

    function attrMapper(v){
        return baseAttrMapper(v);
    };

    const targets = vertex.node.children.map(child=>vertices.get(child));

    const d=makeCoalescent(vertex,targets,scales);
    let visibleProperties=attrMapper(vertex);


    return (<path className={"node-shape"} d={d}{...visibleProperties}/>);

};
//TODO linear gradient render prop or something.

basicCalescentNode.defaultProps= {
    attrs: {
        fill: "steelblue",
        strokeWidth: 1,
        stroke: 'black'
    },
};
 const CoalescentNode=React.memo(basicCalescentNode);
export default CoalescentNode;
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
function makeCoalescent(vertex,targets,scales,slope=5){
    //TODO slope based on min
    const x=scales.x(min(targets,d=>d.x)-vertex.x);
    const y1=-scales.y((0.4+vertex.y-min(targets,d=>d.y)));
    const y2 = scales.y(max(targets,d=>d.y)-vertex.y+0.4);

    const topD=link({source:{x:0,y:0},target:{x:x/slope,y:y1}});
    const linker=`L${x},${y1}v${y2-y1}L${x/slope},${y2}`;
    // const linker=`v${y2-y1}`;

    const bottomD=link({source:{x:x/slope,y:y2},target:{x:0,y:0}});
return topD+linker+bottomD;

}

export const FadedCoalescentNode = withLinearGradient(CoalescentNode)
FadedCoalescentNode.defaultProps={
    x1:"0%",
    x2:"100%",
    y1:"0%",
    y2:"0%",
    n:10,
    fillRamper:i=>"grey",
    opacityRamper:i=>1-i*1.2,
}