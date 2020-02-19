import React from "react";
import {range} from "d3-array";
export default function ColorRamp({scale,n,width,height}){
    const updatedScale = scale.domain().length===2?scale.copy().domain([0,n]):scale.copy().domain(range(n));

    const colorStops = [];
    for( let i=0;i<n;i++){
        colorStops.push( <stop key={i} offset={`${i/(n-1)}`} stopColor={updatedScale(i)}/>)
    }
    return (<g className={"colorRamp"}>
    <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            {colorStops}
        </linearGradient>
    </defs>
        <rect width={width} height={height} fill="url(#grad1)"/>
    </g>)

}


ColorRamp.defaultProps = {
    n:10,
    width:200,
    height:50
};