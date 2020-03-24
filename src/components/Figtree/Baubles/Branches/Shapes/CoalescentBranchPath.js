import React, {useCallback, useContext, useMemo} from "react";
import withLinearGradient from "../../../../HOC/WithLinearGradient";
import {LayoutContext} from "../../../FigTree";
import {calcSlope, makeCoalescent} from "../../Nodes/Shapes/CoalescentShape";
import {extent} from "d3-array";
import withClipPath from "../../../../HOC/withClipPath";
import {getTips} from "../../../../..";
import RectangularBranchPath from "./RectangularBranchPath";
import {useScales} from "../../../../../hooks";

const logisticRamp=logisticGrowth(1,0.95,90);
const FadedPath = React.memo(withLinearGradient(RectangularBranchPath));
//Danger hardCoded


function BaseCoalescentBranch(props){
    const {vertices} =  useContext(LayoutContext);
    const {edge,y1,y0} =props;
    const vertex = vertices.get(edge.v0.node);

    const childTargets = vertex.node.children.map(child=>vertices.get(child));
    const targetRange = extent(childTargets,d=>d.x-vertex.x);
    const thisTarget = vertices.get(edge.v1.node);
    const fadedIn = (targetRange[0]*100/ (thisTarget.x - vertex.x));

    const colorRamper=useCallback(i=>props.attrs.stroke,[props.attrs.stroke]);
    const opacityRamper=useCallback(i=>logisticRamp(i),[]);
        return <FadedPath   colorRamper={colorRamper} opacityRamper={opacityRamper} endingX={`${fadedIn}%`} gradientAttribute={"stroke"}
                           {...props}/>


}

const CoalescentBranch=React.memo(BaseCoalescentBranch,()=>true);
CoalescentBranch.defaultProps={
    fade:"relative",
};
export default CoalescentBranch;

function logisticGrowth(L,midpoint,k){
    return function(x){
        return L/(1+Math.exp(-1*k*(x-midpoint)))
    }

}
