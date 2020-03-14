import React, {useCallback, useContext} from "react";
import {curveStepBefore, line} from "d3-shape";
import{useSpring,animated} from "react-spring";
import withLinearGradient from "../../../../HOC/WithLinearGradient";

// potentiall pass in mapper not attrs so we can cache and make more efficient.
const rectangularBranchPath=(props)=>{
    let {x0,y0,x1,y1,attrs} = props;
    let path ={d:branchPathGenerator({x0,y0,x1,y1})};
    const allAttrs= useSpring(attrs);
    return(<animated.path {...allAttrs}  {...path} fill={"none"} />)
};
function branchPathGenerator({x0,y0,x1,y1}) {
        const branchLine = line()
            .x((v) => v.x)
            .y((v) => v.y)
            .curve(curveStepBefore);
        return (
            branchLine(
                [{x: 0, y: y0 - y1},
                    {x: x1 - x0, y: 0}
                ]))
        // return (output)
}
const RectangularBranchPath = React.memo(rectangularBranchPath,sameProps);
function sameProps(prev,curr){
    const primitiveKeys=["x0","y0","x1","y1"];
    for(const key of primitiveKeys){
        if(prev[key]!==curr[key]){
            return false
        }
    }
    return areEqualShallow(prev.attrs,curr.attrs);
}

export default RectangularBranchPath;
const logisticRamp=logisticGrowth(1,0.7,30);

import {LayoutContext,ScaleContext} from "../../../FigTree";
import {calcSlope, coalescentPath, FadedPath, makeCoalescent} from "../../Nodes/Shapes/CoalescentShape";
import {extent, max, min} from "d3-array";
import withClipPath from "../../../../HOC/withClipPath";
import {areEqualShallow} from "../../../../../utils/utilities";



const FadedClippedPath=React.memo(withClipPath(withLinearGradient(RectangularBranchPath)));

function coalescentBranch(props){
    const {vertices} =  useContext(LayoutContext);
    const {scales} = useContext(ScaleContext);
    const {edge,y1,y0} =props;
    const vertex = vertices.get(edge.v0.node);
    const targets = vertex.node.children.map(child=>vertices.get(child));
    const source = {x:0,y:y0-y1};
    const target = {x:scales.x(max(targets,d=>d.x)-vertex.x),
                    y: scales.y((min(targets,d=>d.y))-0.4)-y1};
    const targetRange = extent(targets,d=>d.x-vertex.x);
    const thisTarget = vertices.get(edge.v1.node);
    const slope=targetRange[1]/(targetRange[0]);
    const fadedIn = (targetRange[0]*100/ (thisTarget.x - vertex.x));
    const clipPath=coalescentPath(source,target,slope);

    const colorRamper=useCallback(i=>props.attrs.stroke,[props.attrs.stroke]);
    const opacityRamper=useCallback(i=>logisticRamp(i),[]);

    return <FadedClippedPath
        clipPath={clipPath} clipTransform={`translate(0,${(y0-y1)})`}
        colorRamper={colorRamper} opacityRamper={opacityRamper} endingX={`${fadedIn}%`} gradientAttribute={"stroke"}
        {...props}
    />
}

export const CoalescentBranch=React.memo(coalescentBranch);


function logisticGrowth(L,midpoint,k){
    return function(x){
        return L/(1+Math.exp(-1*k*(x-midpoint)))
    }

}
