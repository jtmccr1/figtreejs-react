import React from "react"
export default function Figure(props){
    const{width,height,margins} = props;

    return(
        <svg width={width} height={height} > // make own component with defaults
            <g transform={`translate(${margins.left},${margins.top})`}>
                {props.children}
            </g>
        </svg>
    )
}

Figure.defaultProps={
    width:800,
    height:600,
    margins:{top:10,right:10,bottom:70,left:70}
}