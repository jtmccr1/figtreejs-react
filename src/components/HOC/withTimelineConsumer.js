import React, {useContext} from "react";
import TimelineContext from "../Timeline";
import XContext from "../Timeline";
/**
 * This HOC returns a plot component with updated scales so that the plot is aligned with a global x timescale.
 * @param WrappedPlot
 * @return {*}
 */
export default function  withTimelineConsumer(WrappedPlot){
    return function(props){
        console.log(useContext(TimelineContext));
    const {timeline,timelineDispatch} = useContext(TimelineContext);

    const componentWidth = useContext(XContext);
    const [currentMinDate,currentMaxDate] = timeline.domain();


    const [incomingMinDate,incomingMaxDate] = props.getDateExtent(props.data);
// update master timeline;
    if(incomingMinDate<currentMinDate){
        if(incomingMaxDate>currentMaxDate){
            timelineDispatch({type:"new extent",payload:{minDate:incomingMinDate,maxDate:incomingMaxDate}})
        }else{
            timelineDispatch({type:"new min",payload:{minDate:incomingMinDate}})
        }
        if(incomingMaxDate>currentMaxDate){
            timelineDispatch({type:"new max",payload:{maxDate:incomingMaxDate}})
        }
    }

    const pos ={x:timeline(incomingMinDate), y:props.pos.y};
    const width = componentWidth-pos.x-(componentWidth-timeline(incomingMaxDate));

    return <WrappedPlot {...props} width={width} pos={pos}/>
    }
}

// plot must have data, getDateExtent function, pos:{x,y}, width, height