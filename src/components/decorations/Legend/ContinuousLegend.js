import React from "react"
import ColorRamp from "./ColorRamp";
import Axis from "../Axis/Axis";
import {format} from "d3-format";
import {quantize, interpolate, interpolateRound} from "d3-interpolate";



/**
 * ContinuousLegend
 *
 * A color legend that accept continuous and sequential color scales. It is modeled after the color legends
 * at https://observablehq.com/@d3/color-legend
 *
 * @param props
 * @param scale
 * @param pos
 * @param width
 * @param height
 * @param direction
 * @param title
 * @param ticks
 * @param tickFormat
 * @return {(number|*)[]|*}
 * @constructor
 */
export default function ContinuousLegend({scale,pos,width,height,direction,title,ticks} ){

    let x;
    let colorRamper;
    //Continuous
    if(scale.interpolate){
        const n = Math.min(scale.domain().length,scale.range().length);
        x = scale.copy().rangeRound(quantize(interpolate(0, width), n)); // for numbers
        colorRamper = scale.copy().domain(quantize(interpolate(0, 1), n)) // for colors
    }  // Sequential
    else if (scale.interpolator) {
        x= Object.assign(scale.copy().interpolator(interpolateRound(0,width)), // update interpolator to work on x scale
            {range(){return[0,width]}}) //vc assigns range function so we can use it later!
        colorRamper=scale.interpolator();
    }
    return(
        <g className={"legend"} transform={`translate(${pos.x},${pos.y})`}>
            <text transform={`translate(0,-6)`}>{title}</text>
            <ColorRamp {...{colorRamper: colorRamper,width,height}}/>
            <Axis transform={`translate(${0},${height})`} {...{width,height,direction,ticks}} scale={x} />
        </g>
    )

}

ContinuousLegend.defaultProps={
    pos:{x:0,y:0},
    width:200,
    height:50,
    direction:"horizontal",
    ticks: {number: 5, format: format(".1f"), padding: 20, style: {}, length: 6},
    title:"",
}