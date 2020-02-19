import React from "react"
import ColorRamp from "./ColorRamp";
import Axis from "../Axis/Axis";
import {format} from "d3-format";
import {scaleLinear, scaleQuantile, scaleSequential, scaleSequentialQuantile} from "d3-scale";

export default function Legend(props){

    const {scale,pos,width,height,direction,title,ticks,tickFormat} = props;

    //Check if quantile scale.
    const axisScale = !scale.ticks?scaleLinear().domain(scale.quantiles(1)).range([0,width]):scale.copy().range([0,width])// this assumes is a quantile may not be

    return(
        <g className={"legend"} transform={`translate(${pos.x},${pos.y})`}>
            <ColorRamp {...{scale,width,height}}/>
            <Axis transform={`translate(${0},${height})`} {...props} scale={axisScale}/>
        </g>
    )


}

Legend.defaultProps={
    pos:{x:0,y:0},
    width:200,
    height:50,
    direction:"horizontal",
    tick: {number: 5, format: format(".1f"), padding: 20, style: {}, length: 6},
}