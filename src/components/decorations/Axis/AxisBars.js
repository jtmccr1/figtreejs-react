import React from 'react'
export  default function AxisBars(props) {
    const {scale,tickValues,height,margins,attrs,evenFill,oddFill} = props;

    return(
        <g className={"axisBars"}>
                {tickValues.reduce((acc,curr,i)=>{
                    const width=i===tickValues.length-1?scale.range()[1]-scale(tickValues[i]):scale(tickValues[i+1]) - scale(tickValues[i]);
                    const fill = i%2===0?evenFill:oddFill;
                    acc.push(<rect key={i} transform={`translate(${scale(tickValues[i])},${-1*(height-margins.bottom)})`} width={width}  height ={(height-margins.bottom)} fill={fill} {...{...{rx:2,ry:2},...attrs}} />);
                    return acc;
                },[])}
        </g>
    )
}

AxisBars.defaultProps={
    evenFill:"#DCDCDC",
    oddFill:"none",
    attrs:{
        rx:2,
        ry:2,
       },
};