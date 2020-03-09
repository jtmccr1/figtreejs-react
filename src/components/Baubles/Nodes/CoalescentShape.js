import React, {useContext, useMemo} from "react"
import {animated, useSpring} from "react-spring";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {LayoutContext, NodeContext, ScaleContext} from "../../FigTree";
import {linkHorizontal} from "d3-shape";
import {max, min} from "d3-array";
import withLinearGradient from "../../HOC/WithLinearGradient";

//TODO extract out fill => gradient function

function BaseCoalescentShape (props){
    //HOC for node logic
    const {vertices} =  useContext(LayoutContext);
    const {scales} = useContext(ScaleContext);

    const {vertex,attrs} =props;

    const targets = vertex.node.children.map(child=>vertices.get(child));

    const d=makeCoalescent(vertex,targets,scales);


    return (<path className={"node-shape"} d={d}{...attrs}/>);

};
//TODO linear gradient render prop or something.

BaseCoalescentShape.defaultProps= {
    attrs: {
        fill: "steelblue",
        strokeWidth: 1,
        stroke: 'black'
    },
    slope:5
};

const link = linkHorizontal()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

export function coalescentPath(source,target,slope=10){
   const adjustedTarget={...target,x:target.x/slope};
   const inverseTarget = {...adjustedTarget,y:source.y  -(adjustedTarget.y-source.y)};
    const topD=link({source:source,target:adjustedTarget});

    const linker=`L${target.x},${target.y}v${inverseTarget.y-adjustedTarget.y}L${inverseTarget.x},${inverseTarget.y}`;
    const bottomD=link({source:inverseTarget,target:source});

    return topD+linker+bottomD+`L${source.x},${source.y}`;
}

export function makeCoalescent(vertex,targets,scales,slope=1){
    // TODO make slope and percent gradient based on min x
    const x=scales.x(max(targets,d=>d.x)-vertex.x);
    const y=-scales.y((0.4+vertex.y-min(targets,d=>d.y)));
    return coalescentPath({x:0,y:0},{x:x,y:y})

}

const CoalescentShape = withLinearGradient(BaseCoalescentShape);
CoalescentShape.defaultProps={
    x1:"0%",
    x2:"100%",
    y1:"0%",
    y2:"0%",
    n:10,
    fillRamper:i=>"grey",
    opacityRamper:i=>1-i,
    slope:5
};
export default CoalescentShape;
