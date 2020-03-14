import React from "react"
import {scaleLinear} from "d3-scale";

const  defaultTimeline =  {time:scaleTime().domain([new Date("1990"), new Date()]).range([0,220])};
const masterTimeLine = React.createContext(null);


export default function Figure(props){
    const{width,height,margins} = props;
    const range={x:(width-margins.left-margins.right),y:(height-margins.top-margins.bottom)}

    const [timeline,timeLineDispatch] = useReducer(timeLineReducer,defaultTimeline)



    return(
        <masterTimeLine.Provider>
            <svg width={width} height={height} > // make own component with defaults
                <g transform={`translate(${margins.left},${margins.top})`}>
                    {props.children}
                </g>
            </svg>
        </masterTimeLine.Provider>
    )
}

Figure.defaultProps={
    width:800,
    height:600,
    margins:{top:10,right:10,bottom:70,left:70}
}

function timelineReducer(){

}