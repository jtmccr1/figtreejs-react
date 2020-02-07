import React from "react";
import {curveStepBefore, line} from "d3-shape";
import{useSpring,animated} from "react-spring";

export default function BranchPath(props){

    const {scales,edge,attrs,...rest} = props;
    const pathGenerator = branchPathGenerator(scales);
    const path = useSpring({d:pathGenerator(edge)});
    // if attr entry is a function call it on the vertex.
    let updatedAttrs={};
    for (const key of Object.keys(attrs)){
        if(attrs[key] && {}.toString.call(attrs[key]) === '[object Function]'){
            updatedAttrs[key]=attrs[key](vertex)
        }else{
            updatedAttrs[key]=attrs[key]
        }
    }
    updatedAttrs= useSpring({...updatedAttrs});

    return(<animated.path {...path} {...updatedAttrs} {...rest}/>)
}

function branchPathGenerator(scales) {
    return (e) => {
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
                [{x: 0, y: scales.y(e.v0.y) - scales.y(e.v1.y)},
                    {x: scales.x(e.v1.x) - scales.x(e.v0.x), y: 0}
                ]))
        // return (output)

    };
}