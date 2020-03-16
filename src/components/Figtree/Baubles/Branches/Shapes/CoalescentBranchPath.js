import React, {useCallback, useContext, useMemo} from "react";
import withLinearGradient from "../../../../HOC/WithLinearGradient";
import {LayoutContext,ScaleContext} from "../../../FigTree";
import {calcSlope, makeCoalescent} from "../../Nodes/Shapes/CoalescentShape";
import {extent} from "d3-array";
import withClipPath from "../../../../HOC/withClipPath";
import {getTips} from "../../../../..";
import RectangularBranchPath from "./RectangularBranchPath";

const logisticRamp=logisticGrowth(1,0.7,30);
const FadedClippedPath=React.memo(withClipPath(withLinearGradient(RectangularBranchPath)));

function coalescentBranch(props){
    const {vertices} =  useContext(LayoutContext);
    const {scales} = useContext(ScaleContext);
    const {edge,y1,y0} =props;

    const vertex = vertices.get(edge.v0.node);

    const childTargets = vertex.node.children.map(child=>vertices.get(child));
    const targets = useMemo(()=>getTips(vertex.node).map(decedent=>vertices.get(decedent)).concat(childTargets),[vertex]);
    const targetRange = extent(childTargets,d=>d.x-vertex.x);
    const thisTarget = vertices.get(edge.v1.node);
    const slope = calcSlope(vertex,targets);
    const fadedIn = (targetRange[0]*100/ (thisTarget.x - vertex.x));
    const clipPath=useMemo(()=>makeCoalescent(vertex,targets,scales,slope,{x:0,y:y0-y1}),[vertex,scales,edge]);
    const colorRamper=useCallback(i=>props.attrs.stroke,[props.attrs.stroke]);
    const opacityRamper=useCallback(i=>logisticRamp(i),[]);

    return <FadedClippedPath
        clipPath={clipPath} clipTransform={`translate(0,${(y0-y1)})`}
        colorRamper={colorRamper} opacityRamper={opacityRamper} endingX={`${fadedIn}%`} gradientAttribute={"stroke"}
        {...props}
    />
}

const CoalescentBranch=React.memo(coalescentBranch,()=>false);
export default CoalescentBranch;

function logisticGrowth(L,midpoint,k){
    return function(x){
        return L/(1+Math.exp(-1*k*(x-midpoint)))
    }

}
