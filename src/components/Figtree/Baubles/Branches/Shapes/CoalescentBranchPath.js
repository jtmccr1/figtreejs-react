import React, {useCallback, useContext, useMemo} from "react";
import withLinearGradient from "../../../../HOC/WithLinearGradient";
import {extent} from "d3-array";
import RectangularBranchPath from "./RectangularBranchPath";
import {useLayout} from "../../../../../hooks";
import {areEqualShallow} from "../../../../../utils/utilities";

const logisticRamp=logisticGrowth(1,0.95,90);
const FadedPath = React.memo(withLinearGradient(RectangularBranchPath),sameProps);
//Danger hardCoded


function BaseCoalescentBranch(props){
    const {vertices} =  useLayout();
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

const CoalescentBranch=React.memo(BaseCoalescentBranch,sameProps);
function sameProps(prev,curr){
    const primitiveKeys=["x0","y0","x1","y1"];
    for(const key of primitiveKeys){
        if(prev[key]!==curr[key]){
            return false
        }
    }
    return areEqualShallow(prev.attrs,curr.attrs);
}

CoalescentBranch.defaultProps={
    fade:"relative",
};
export default CoalescentBranch;

function logisticGrowth(L,midpoint,k){
    return function(x){
        return L/(1+Math.exp(-1*k*(x-midpoint)))
    }

}
