import React from 'react'
export  default function AxisBars(props) {
    const {scale,ticks,height,margins,attrs} = props;
    const tickWidth = scale(ticks[1]) - scale(ticks[0]);
    console.log("bars");
    return(
        <g className={"axisBars"}>
                {ticks.reduce((acc,curr,i)=>{
                            if(i%2===0){
                                acc.push(<rect key={i} transform={`translate(${i*tickWidth},${-1*(height-margins.top-margins.bottom)})`} width={tickWidth}  height ={(height-margins.top-margins.bottom)} {...attrs} />);
                            }
                        return acc;
                },[])}
        </g>
    )
}

AxisBars.defaultProps={
    attrs:{
        fill:"#DCDCDC",
        rx:5,
        ry:5,    }
};