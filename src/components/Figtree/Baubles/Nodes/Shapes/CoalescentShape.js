import React, {useContext} from "react"
import {LayoutContext} from "../../../FigTree";
import {linkHorizontal} from "d3-shape";
import {extent, max, min} from "d3-array";
import withLinearGradient from "../../../../HOC/WithLinearGradient";
import {getTips} from "../../../../../utils/Tree/treeSettersandGetters"
import {useScales} from "../../../../../hooks";
//TODO extract out fill => gradient function

const pathComponent=({attrs})=><path {...attrs}/>;

export const FadedPath=withLinearGradient(pathComponent);

export default function CoalescentShape (props){
    const {vertices} =  useContext(LayoutContext);
    const {scales} = useScales();
    const {vertex,attrs} =props;

    const targets = getTips(vertex.node).map(decedent=>vertices.get(decedent))
        .concat(vertex.node.children.map(child=>vertices.get(child)));

    const slope = calcSlope(vertex,targets);
    const d=makeCoalescent(vertex,targets,scales,slope);


    return  <FadedPath attrs={{...attrs,d:d}} endingX={`${100/slope}%`} colorRamper={i=>attrs.fill} opacityRamper={i=>1-i} />
};

CoalescentShape.defaultProps= {
    attrs: {
        fill: "steelblue",
        strokeWidth: 1,
        stroke: 'black'
    },
};

const link = linkHorizontal()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

/**
 * A helper function that takes a source and target object (with x, and y positions each) It calculates a symmetric
 * coalescent shape between source, the target and the reflection of the taget about a horizontal line through the source.
 * @param source -
 * @param target -  the target object {x:,y:}
 * @param slope - a number that deterimines how quickly the curve reaches the max/min height
 * @param startWidth - The starting width of the shape
 * @return string
 */

// need max x for top and bottom, diff y
export function coalescentPath(source,topTarget,bottomTarget,slope=10,startWidth=2){
   const adjustedTopTarget={y:topTarget.y,x:topTarget.x/slope};
   const adjustedBottomTarget = {x:bottomTarget.x/slope,y:bottomTarget.y};

   const start = {x:source.x,y:source.y-startWidth/2};
   const end = {x:source.x,y:source.y+startWidth/2};

   const topD=link({source:start,target:adjustedTopTarget});
   const linker=`L${topTarget.x},${topTarget.y}v${adjustedBottomTarget.y-adjustedTopTarget.y},0L${adjustedBottomTarget.x},${adjustedBottomTarget.y}`;
   const bottomD=link({source:adjustedBottomTarget,target:end});

   return topD+linker+bottomD+`L${start.x},${start.y}`;
}

/**
 * This function takes a source vertex and target vertices. It calculates the target
 * for vertex and passes data on to the coalescent path function.
 * @param vertex
 * @param targets
 * @param scales
 * @param slope
 * @return string
 */
export function makeCoalescent(vertex,targets,scales,slope=1,adjustments={x:0,y:0}){
    const xStart = adjustments.x;
    const xEnd=scales.x(max(targets,d=>d.x)-vertex.x)+adjustments.x;
    const yStart = adjustments.y;
    const yTop=-scales.y((vertex.y-min(targets,d=>d.y)+0.4))+adjustments.y;
    const yBottom =scales.y((max(targets,d=>d.y)-vertex.y+0.4))+adjustments.y;

    return coalescentPath({x:xStart,y:yStart},{x:xEnd,y:yTop},{x:xEnd,y:yBottom},slope)
}

/**
 * A helper function that takes the source and target vertices
 * and calculates the slope so that the curve flattens and at
 * at the closest vertex (in the x direction).
 * @param source
 * @param targets
 */
export function calcSlope(source,targets){
    const [min,max]=extent(targets,d=>d.x-source.x);
    return max / min;
}

// const CoalescentShape = withLinearGradient(BaseCoalescentShape);
// CoalescentShape.defaultProps={
//     x1:"0%",
//     x2:"50%",
//     y1:"0%",
//     y2:"0%",
//     n:10,
//     colorRamper:i=>"grey",
//     opacityRamper:i=>1-i*3,
//     slope:5
// };
// export default CoalescentShape;
