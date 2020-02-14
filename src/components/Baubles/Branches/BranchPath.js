import React from "react";
import {curveStepBefore, line} from "d3-shape";
import{useSpring,animated} from "react-spring";

const BranchPath=(props)=>{

    let {x0,y0,x1,y1,...attrs} = props;
    let path ={d:branchPathGenerator({x0,y0,x1,y1})};

    const allAttrs= useSpring({...attrs});
    return(<animated.path {...allAttrs}  {...path} fill={"none"} />)
}

function branchPathGenerator({x0,y0,x1,y1}) {
        const branchLine = line()
            .x((v) => v.x)
            .y((v) => v.y)
            .curve(curveStepBefore);
        // const factor = e.v0.y - e.v1.y > 0 ? 1 : -1;
        // const dontNeedCurve = e.v0.y - e.v1.y === 0 ? 0 : 1;
        // const output = curveRadius > 0 ?
        //     branchLine(
        //         [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
        //             {x: 0, y: dontNeedCurve * factor * curveRadius},
        //             {x: 0 + dontNeedCurve * curveRadius, y: 0},
        //             {x: scales.x(e.v1.x) - scales.x(e.v0.x ), y: 0}
        //         ]) :

        return (
            branchLine(
                [{x: 0, y: y0 - y1},
                    {x: x1 - x0, y: 0}
                ]))
        // return (output)
}
export default React.memo(BranchPath)

BranchPath.defaultProps={
    strokeWidth:2,
    stroke:" #541753",
    strokeLinecap:"round",
    strokeLinejoin:"round"
}

