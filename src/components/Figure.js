import React from "react"
//TODO figure should share scales
export default function Figure(props){
    const{width,height,margins} = props;

    const domain={x:(width-margins.left-margins.right),y:(height-margins.top-margins.bottom)}

    return(
        <svg width={width} height={height} > // make own component with defaults
            <g transform={`translate(${margins.left},${margins.top})`}>
                {React.Children.map(props.children, (child, index) => {
                    return React.cloneElement(child, {domain})
                })}
            </g>
        </svg>
    )
}

Figure.defaultProps={
    width:800,
    height:600,
    margins:{top:10,right:10,bottom:70,left:70}
}