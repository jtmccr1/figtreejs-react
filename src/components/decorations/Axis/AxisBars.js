import React from 'react'
export  default function AxisBars(props) {
    const {scale,tickValues,height,margins,attrs,evenGaps} = props;


    const remainder = evenGaps?0:1;

    //TODO handel the start of the axis to the first tick
    return(
        <g className={"axisBars"}>
                {tickValues.reduce((acc,curr,i)=>{
                    const width=i===tickValues.length-1?scale.range()[1]-scale(tickValues[i]):scale(tickValues[i+1]) - scale(tickValues[i]);
                            if(i%2===remainder){
                                acc.push(<rect key={i} transform={`translate(${scale(tickValues[i])},${-1*(height-margins.bottom)})`} width={width}  height ={(height-margins.bottom)} {...{...{rx:2,ry:2},...attrs}} />);
                            }
                        return acc;
                },[])}
        </g>
    )
}

AxisBars.defaultProps={
    attrs:{
        fill:"#DCDCDC",
        rx:2,
        ry:2,
       },
    evenGaps:true,
};