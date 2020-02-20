import React from "react";

/** Color ramp
 *
 * This color ramp is inspired by the ramp used in https://observablehq.com/@d3/color-legend.
 * It takes a function whose input is between 0,1 and outputs a color. It uses this interpolator
 * to map the progress along a rectangle to a color gradient.
 * @param ramper
 * @param n
 * @param width
 * @param height
 * @return {*}
 * @constructor
 */

export default function ColorRamp({ramper,n,width,height}){

    const colorStops = [];
    for( let i=0;i<n;i++){
        colorStops.push( <stop key={i} offset={`${i/(n-1)}`} stopColor={ramper(i/(n-1))}/>)
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