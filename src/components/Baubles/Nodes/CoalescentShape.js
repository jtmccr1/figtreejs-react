import React, {useContext, useMemo} from "react"
import {animated, useSpring} from "react-spring";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {LayoutContext, NodeContext, ScaleContext} from "../../FigTree";
import {linkHorizontal} from "d3-shape";
import {max, min,extent} from "d3-array";
import withLinearGradient from "../../HOC/WithLinearGradient";

//TODO extract out fill => gradient function
let counter =1;

export default function CoalescentShape (props){
    //HOC for node logic
    const {vertices} =  useContext(LayoutContext);
    const {scales} = useContext(ScaleContext);

    const {vertex,attrs} =props;

    const {fill,path} = filterOutStrokeAttrs(attrs);

    const targets = vertex.node.children.map(child=>vertices.get(child));
    const targetRange = extent(targets,d=>d.x-vertex.x);
    // get 1/2 xmin  in terms of total and 3/4 min

    const slope=targetRange[1]/(targetRange[0]/1);
    const fadedOut = targetRange[0]*15/16 / targetRange[1];


    const {full:d,top,bottom}=makeCoalescent(vertex,targets,scales,slope);

    const colorStops = [];

    for( let i=0;i<11;i++){
        const style={stopColor:fill.fill,stopOpacity:(1-(i/10))};
        colorStops.push( <stop key={i} offset={`${i/(10)}`} {...style}/>)
    }

    const idNumber = (counter+=1);
    return (
        <g>
            <defs>
                <linearGradient id={`gradCoal${idNumber}`} x1={"0%"} y1={"0%"} x2={`${fadedOut*100}%`} y2={"0%"}>
                    {colorStops}
                </linearGradient>
                </defs>
                <path className={"node-shape"} d={d}{...fill} fill={`url(#gradCoal${idNumber})`}/>
                <path d={top} {...path} fill={"none"}/>
                <path d={bottom} {...path} fill={"none"}/>
        </g>
);

};

CoalescentShape.defaultProps= {
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

    const linker=`L${target.x},${target.y}v${inverseTarget.y-adjustedTarget.y},0L${inverseTarget.x},${inverseTarget.y}`;
    const bottomD=link({source:inverseTarget,target:source});
    return {full:topD+linker+bottomD+`L${source.x},${source.y}`,top:topD,bottom:bottomD};
}

export function makeCoalescent(vertex,targets,scales,slope=1){
    // TODO make slope and percent gradient based on min x
    const x=scales.x(max(targets,d=>d.x)-vertex.x);
    const y=-scales.y((0.4+vertex.y-min(targets,d=>d.y)));
    return coalescentPath({x:0,y:0},{x:x,y:y},slope)

}


function filterOutStrokeAttrs(attrs){
    const fill = Object.keys(attrs).filter(k=>!k.includes("stroke"))
        .reduce((obj, key) => {
        obj[key] = attrs[key];
        return obj;
    }, {});

    const path =Object.keys(attrs).filter(k=>k.includes("stroke"))
        .reduce((obj, key) => {
            obj[key] = attrs[key];
            return obj;
        }, {});
    return {fill,path}
}

// const CoalescentShape = withLinearGradient(BaseCoalescentShape);
// CoalescentShape.defaultProps={
//     x1:"0%",
//     x2:"50%",
//     y1:"0%",
//     y2:"0%",
//     n:10,
//     fillRamper:i=>"grey",
//     opacityRamper:i=>1-i*3,
//     slope:5
// };
// export default CoalescentShape;
