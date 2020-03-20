import React,{useContext} from 'react'
import {line} from "d3-shape"
import {mean,quantile,range} from "d3-array"
import {format} from "d3-format"
import {useScales} from "../../../hooks";
export  default function Axis(props) {

    const {scales,width,height}=useScales();
    const {direction,title,ticks,gap} = props;
    const scale = makeAxisScale(props,scales);
    // scaleSequentialQuantile doesn’t implement tickValues or tickFormat.
    let tickValues;
    if (!scale.ticks) {
            tickValues = range(ticks.number).map(i => quantile(scale.domain(), i / (ticks.number - 1)));
    }else{
        tickValues = scale.ticks(ticks.number);
    }

    const transform=direction==="horizontal"? `translate(${0},${height+gap})`:`translate(${-1*gap},${0})`;

//TODO break this into parts HOC with logic horizontal/ vertical axis ect.
    return(
        <g className={"axis"} transform={transform}>
            {/*This is for Bars*/}
            {React.Children.toArray(props.children).map((child, index) => {
                return React.cloneElement(child, {
                    scale,
                    width,
                    height,
                    tickValues,
                    gap
                });
            })}

            <path d={getPath(scale,direction)} stroke={"black"}/>
            <g>
                {tickValues.map((t, i)=>{
                   return(
                       <g key={i} transform={`translate(${(direction==="horizontal"?scale(t):0)},${(direction==="horizontal"?0:scale(t))})`}>
                        <line {...getTickLine(ticks.length,direction)} stroke={"black"}/>
                        <text transform={`translate(${(direction==="horizontal"?0:ticks.padding)},${(direction==="horizontal"?ticks.padding:0)})`}
                              textAnchor={"middle"} alignmentBaseline={"middle"}>{ticks.format(t)}</text>
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
//TODO merge these in instead of overwriting;
Axis.defaultProps= {
    offsetBy:0,
    scaleBy:1,
    reverse:false,
    gap:5,
    title: {text: "", padding: 40, style: {}},
    ticks: {number: 5, format: format(".1f"), padding: 20, style: {}, length: 6},
    direction: "horizontal",
    scale:undefined,
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

/**
 * A helper function to make the scale used in the axis. if supplied by props then no modifications are
 * applied.
 * @param props
 * @param contextScales
 * @returns {*}
 */
function makeAxisScale(props,contextScales) {
    const {reverse, offsetBy, scaleBy, scale, direction} = props;

    const axisScale = (scale === undefined ? (direction === "horizontal" ? contextScales.x : contextScales.y) : scale).copy();
    if(scale===undefined) {
        if (reverse) {
            axisScale.domain(axisScale.domain().reverse());
        }
        if(offsetBy!==0||scaleBy!==1){
            return axisScale.domain(axisScale.domain().map(d => (d + offsetBy) * scaleBy));
        }
    }
        return axisScale



}