import React,{useMemo} from "react"
import {extent} from "d3-array";
import {scaleLinear} from "d3-scale";
import {ScaleContext, DataContext, InteractionContext} from "../../Context/Context";
import withConditionalContextProvider from "../HOC/withConditionalContextProvider";

/**
 * This is a basic plot component. It takes data, layout,width, height and position of a group on an svg
 * and creates the scales and layouted out data needed for a visualization. It provides data, scales, and
 * default interactions as context for it's children.
 *
 * @param props
 * @constructor
 */
function PlotLayer(props){
    const {width,height,pos,data,scales} = props;
return(
    <ScaleContext.Provider value={{scales,width,height}}>
        <DataContext.Provider value={data}>
            <g transform={`translate(${pos.x},${pos.y})`}>
                {props.children}
            </g>
        </DataContext.Provider>
    </ScaleContext.Provider>
);
}
export default withConditionalContextProvider(PlotLayer,InteractionContext);