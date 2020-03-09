import React, {useContext} from "react";
import {curveStepBefore, line} from "d3-shape";
import{useSpring,animated} from "react-spring";
import withLinearGradient from "../../HOC/WithLinearGradient";

const RectangularBranchPath=(props)=>{
    let {x0,y0,x1,y1,edge,...attrs} = props;
    let path ={d:branchPathGenerator({x0,y0,x1,y1})};
    const allAttrs= useSpring({...attrs});
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
export default RectangularBranchPath


export const FadeInBranchPath=withLinearGradient((props)=>{
    let {x0,y0,x1,y1,attrs} = props;
    let path ={d:branchPathGenerator({x0,y0,x1,y1})};
    return(<path  {...attrs}  {...path} fill={"none"} />)
});



import {LayoutContext,ScaleContext} from "../../FigTree";
import {coalescentPath, makeCoalescent} from "../Nodes/CoalescentShape";
import {max, min} from "d3-array";

function CoalescentBranchPathHOC(RegularPath){
    // TODO memoize upto source and taget since its called for all sibling and is the same
    return function CoalescentBP(props){
        const {vertices} =  useContext(LayoutContext);
        const {scales} = useContext(ScaleContext);
        const {edge,y1,y0} =props;
        const vertex = vertices.get(edge.v0.node);
        const targets = vertex.node.children.map(child=>vertices.get(child));
        const source = {x:0,y:y0-y1};
        const target = {x:scales.x(max(targets,d=>d.x)-vertex.x),
                        y: scales.y((min(targets,d=>d.y)))-y1};


        const clipPath=coalescentPath(source,target);

        return (
            <g>
            <defs>
                <clipPath id={`clipPathEdge${edge.v1.id}`}>
                    <path d={clipPath}/>
                </clipPath>
            </defs>
                <g clipPath={ `url(#clipPathEdge${edge.v1.id})`} >
                {/*<g>*/}
                <RectangularBranchPath {...props}/>
                </g>
        </g>
        )
    }

}

export const CoalescentBranch = CoalescentBranchPathHOC(RectangularBranchPath);

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
