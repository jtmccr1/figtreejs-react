import Path from "../svgElements/Path";
import React from "react";
import {curveStepBefore, line} from "d3-shape";

export default function BranchPath(props){

    const {scales} = props;
    const{edge}=props;
    const pathGenerator = branchPathGenerator(scales);
    const path = pathGenerator(edge);

    return(
        <Path key={edge.id} d={path} fill={"none"} strokeWidth={2} stroke={"black"}/>
    )
}

function branchPathGenerator(scales) {
    return (e) => {
        const branchLine = line()
            .x((v) => v.x)
            .y((v) => v.y)
            .curve(curveStepBefore)
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
                [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    {x: scales.x(e.v1.x) - scales.x(e.v0.x), y: 0}
                ]))
        // return (output)

    };
}