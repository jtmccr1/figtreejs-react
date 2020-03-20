import React,{useMemo} from "react"
import {extent} from "d3-array";
import {scaleLinear} from "d3-scale";
import {ScaleContext, DataContext} from "../../Context/Context";
import withConditionalInteractionProvider from "../HOC/withConditionalInteractionProvider";

/**
 * This is a basic plot component. It takes data, layout,width, height and position of a group on an svg
 * and creates the scales and layouted out data needed for a visualization. It provides data, scales, and
 * default interactions as context for it's children.
 *
 * @param props
 * @constructor
 */
// todo optional x and y accessors. and scale is just a scale type.
function PlotLayer(props){
    const {width,height,pos,data,scaleTypes,dataAccessor} = props;
    const scales = setUpScales(width,height,data,dataAccessor,scaleTypes);
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
export default withConditionalInteractionProvider(PlotLayer);

function setUpScales(width,height,data,dataAccessor,scaleTypes){
    //data is an array
    const xDomain = extent(data.reduce((acc,d)=> acc.concat(extent(dataAccessor.x(d))),[]));
    const yDomain = extent(data.reduce((acc,d)=> acc.concat(extent(dataAccessor.y(d))),[]));
    const x = scaleTypes.x().domain(xDomain).range([0,width]);
    const y = scaleTypes.y().domain(yDomain).range([height,0]);
    return {x,y};

}
