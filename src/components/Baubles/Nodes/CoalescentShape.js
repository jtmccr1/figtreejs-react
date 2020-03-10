import React, {useContext} from "react"
import {LayoutContext, ScaleContext} from "../../FigTree";
import {linkHorizontal} from "d3-shape";
import {extent, max, min} from "d3-array";
import withLinearGradient from "../../HOC/WithLinearGradient";

//TODO extract out fill => gradient function

const pathComponent=({attrs})=><path {...attrs}/>;

export const FadedPath=withLinearGradient(pathComponent);

export default function CoalescentShape (props){
    const {vertices} =  useContext(LayoutContext);
    const {scales} = useContext(ScaleContext);
    const {vertex,attrs} =props;

    const targets = vertex.node.children.map(child=>vertices.get(child));

    const slope = calcSlope(vertex,targets);

    const d=makeCoalescent(vertex,targets,scales,slope);

    return (
        <FadedPath attrs={{...attrs,d:d}} endingX={`${100/slope}%`} colorRamper={i=>attrs.fill} opacityRamper={i=>1-i} />
    )

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
export function coalescentPath(source,target,slope=10,startWidth=2){
   const adjustedTarget={y:target.y,x:target.x/slope};
   const inverseTarget = {x:adjustedTarget.x,y:source.y  -(adjustedTarget.y-source.y)};
   const start = {x:source.x,y:source.y-startWidth/2};
   const end = {x:source.x,y:source.y+startWidth/2};

   const topD=link({source:start,target:adjustedTarget});
   const linker=`L${target.x},${target.y}v${inverseTarget.y-adjustedTarget.y},0L${inverseTarget.x},${inverseTarget.y}`;
   const bottomD=link({source:inverseTarget,target:end});

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
export function makeCoalescent(vertex,targets,scales,slope=1,){
    // TODO make slope and percent gradient based on min x
    const x=scales.x(max(targets,d=>d.x)-vertex.x);
    const y=-scales.y((0.4+vertex.y-min(targets,d=>d.y)));
    return coalescentPath({x:0,y:0},{x:x,y:y},slope)

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
