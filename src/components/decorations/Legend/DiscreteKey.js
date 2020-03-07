import React from "react"
import ColorRamp from "./ColorRamp";
import Axis from "../Axis/Axis";
import {format} from "d3-format";
import {quantize, interpolate, interpolateRound} from "d3-interpolate";



/**
 * Legend
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
export default function Legend({scale,pos,width,height,direction,title} ){

    return(
        <g className={"legend"} transform={`translate(${pos.x},${pos.y})`}>
            <text transform={`translate(0,-6)`}>{title}</text>


        </g>
    )

}

Legend.defaultProps={
    pos:{x:0,y:0},
    width:200,
    height:50,
    direction:"horizontal",
    ticks: {number: 5, format: format(".1f"), padding: 20, style: {}, length: 6},
    title:"",
}