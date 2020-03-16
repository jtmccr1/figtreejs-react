import React, {useReducer} from "react"
import {scaleLinear, scaleTime} from "d3-scale";
import timelineReducer from "../Context/reducers/timelineReducer";

const  defaultTimeline =  scaleTime().domain([new Date(8640000000000000),new Date(-8640000000000000)]).range([0,220]);

export const TimelineContext = React.createContext(scaleTime);
export const XContext = React.createContext(100);

/**
 * A wrapping component that can place multiple child plots on the same x axis and gives position to children plots
 * @param props
 * @return {*}
 * @constructor
 */
export default function Timeline(props){
    const{width,height,margins,padding} = props;
    const componentWidth = width-margins.left-margins.right;

    defaultTimeline.range([0,width-margins.left-margins.right]);

    const [timeline,timelineDispatch] = useReducer(timelineReducer,defaultTimeline);
    return(
        <TimelineContext.Provider value={{timeline,timelineDispatch}}>
            <XContext.Provider value={componentWidth}>
            <svg width={width} height={height} > // make own component with defaults
                <g transform={`translate(${margins.left},${margins.top})`}>
                    {props.children}
                </g>
            </svg>
            </XContext.Provider>
        </TimelineContext.Provider>
    )
}

Timeline.defaultProps={
    width:800,
    height:600,
    margins:{top:10,right:10,bottom:70,left:70},
    padding:50
};
