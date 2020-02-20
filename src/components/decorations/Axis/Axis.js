import React from 'react'
import {line} from "d3-shape"
import {mean,quantile,range} from "d3-array"
import {format} from "d3-format"


export  default function Axis(props) {

    const {scales,direction,title,ticks,width,height,margins} = props;

    let scale = props.scale === undefined?(direction==="horizontal"?scales.x:scales.y):props.scale;


    // scaleSequentialQuantile doesn’t implement tickValues or tickFormat.
    let tickValues;
    if (!scale.ticks) {
        console.log("quantile")
            tickValues = range(ticks.number).map(i => quantile(scale.domain(), i / (ticks.number - 1)));
    }else{
        tickValues = scale.ticks(ticks.number);
    }


//TODO break this into parts
    return(
        <g className={"axis"} transform={props.transform}>
            {React.Children.toArray(props.children).map((child, index) => {
                return React.cloneElement(child, {
                    scale,
                    width,
                    height,
                    margins,
                    tickValues,
                });
            })}
            <path d={getPath(scale,direction)} stroke={"black"}/>
            <g>
                {tickValues.map((t, i)=>{
                   return(
                       <g key={i} transform={`translate(${(direction==="horizontal"?scale(t):0)},${(direction==="horizontal"?0:scale(t))})`}>
                        <line {...getTickLine(ticks.length,direction)} stroke={"black"}/>
                        <text transform={`translate(${(direction==="horizontal"?0:ticks.padding)},${(direction==="horizontal"?ticks.padding:0)})`} textAnchor={"middle"}>{ticks.format(t)}</text>
                    </g>
                   )
                })}
                {/*TODO sometimes scale doesn't have a range*/}
                <g transform={`translate(${(direction==="horizontal"?mean(scale.range()):title.padding)},${(direction==="horizontal"?title.padding:mean(scale.range()))})`}>
                    <text textAnchor={"middle"}>{title.text}</text>
                </g>
            </g>

        </g>

    )
}

Axis.defaultProps= {
    scale: undefined,
    scales:{x:undefined,y:undefined},
    title: {text: "", padding: 40, style: {}},
    ticks: {number: 5, format: format(".1f"), padding: 20, style: {}, length: 6},
    direction: "horizontal",
};

function getPath(scale,direction){
    const f = line().x(d=>d[0]).y(d=>d[1]);

    if(direction==='horizontal'){
        return f(scale.range().map(d=>[d,0]))
    }else if(direction==="vertical"){
        return f(scale.range().map(d=>[0,d]))
    }
}
function getTickLine(length,direction){
    if(direction==="horizontal"){
        return{x1:0,y1:0,y2:length,x2:0}
    }else if(direction==="vertical"){
        return{x1:0,y1:0,y2:0,x2:-1*length}

    }
}