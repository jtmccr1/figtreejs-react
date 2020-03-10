import React, {useContext} from "react";
import {curveStepBefore, line} from "d3-shape";
import{useSpring,animated} from "react-spring";
import withLinearGradient from "../../HOC/WithLinearGradient";

const RectangularBranchPath=(props)=>{
    let {x0,y0,x1,y1,edge,...attrs} = props;
    let path ={d:branchPathGenerator({x0,y0,x1,y1})};
    // const allAttrs= useSpring({...attrs});
    return(<animated.path {...attrs}  {...path} fill={"none"} />)
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
export default RectangularBranchPath


export const FadeInBranchPath=withLinearGradient((props)=>{
    let {x0,y0,x1,y1,attrs} = props;
    let path ={d:branchPathGenerator({x0,y0,x1,y1})};
    return(<path  {...attrs}  {...path} fill={"none"} />)
});

const logisticRamp=logisticGrowth(1,0.9,100);


import {LayoutContext,ScaleContext} from "../../FigTree";
import {coalescentPath, makeCoalescent} from "../Nodes/CoalescentShape";
import {extent, max, min} from "d3-array";

function CoalescentBranchPathHOC(RegularPath){
    // TODO memoize up to source and taget since its called for all sibling and is the same
    return function CoalescentBP(props){
        const {vertices} =  useContext(LayoutContext);
        const {scales} = useContext(ScaleContext);
        const {edge,y1,y0,...attrs} =props;
        const vertex = vertices.get(edge.v0.node);
        const targets = vertex.node.children.map(child=>vertices.get(child));
        const source = {x:0,y:y0-y1};
        const target = {x:scales.x(max(targets,d=>d.x)-vertex.x),
                        y: scales.y((min(targets,d=>d.y))-0.4)-y1};


        const targetRange = extent(targets,d=>d.x-vertex.x);
        const thisTarget = vertices.get(edge.v1.node);
        // get 1/2 xmin  in terms of total and 3/4 min
    // TODO make functional this is repeated in coalescent shape and has too many magic numbers
        const slope=targetRange[1]/(targetRange[0]/1);
        const fadedIn = (targetRange[0]*15/16 / (thisTarget.x - vertex.x));


        const d=coalescentPath(source,target,slope);
        const colorStops = [];

        for( let i=0;i<11;i++){
            const style={stopColor:attrs.stroke,stopOpacity:logisticRamp(i/10)};
            colorStops.push( <stop key={i} offset={`${i/(10)}`} {...style}/>)
        }

        return (
            <g>
            <defs>
                <clipPath id={`clipPathEdge${edge.v1.id}`}>
                    <path d={d}/>
                </clipPath>
                <linearGradient id={`gradCoal${edge.v1.id}`} x1={"0%"} y1={"0%"} x2={`${fadedIn*100}%`} y2={"0%"}>
                    {colorStops}
                </linearGradient>
            </defs>
                <g clipPath={ `url(#clipPathEdge${edge.v1.id})`} >
                {/*<g>*/}
                <RectangularBranchPath {...props} stroke={`url(#gradCoal${edge.v1.id})`}/>
                </g>
        </g>
        )
    }

}

export const CoalescentBranch = CoalescentBranchPathHOC(RectangularBranchPath);



function logisticGrowth(L,midpoint,k){
    return function(x){
        return L/(1+Math.exp(-1*k*(x-midpoint)))
    }

}
// FadeInBranchPath.defaultProps={
//     x1:"0%",
//     x2:"100%",
//     y1:"0%",
//     y2:"0%",
//     n:10,
//     fillRamper:i=>"#541753",
//     opacityRamper:i=>i<0.5?i/2:i,
//     gradientAttribute: "stroke",
//     attrs:{
//         strokeWidth:2,
//         stroke:"#541753",
//         strokeLinecap:"round",
//         strokeLinejoin:"round"
//     }
//    //issure with attrss
//
// }
