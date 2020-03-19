import React, {useContext} from 'react';
import BaseElement from "../Plots/Elements/BaseElements"
import {ProjectionContext} from "./Map"
import {geoPath} from "d3-geo";
import {useAttributeMappers} from "../../hooks";

export default function Features(props){

    const {hoverKey,selectionKey,geographies} = props;
    const shapeProps = useAttributeMappers(props,hoverKey,selectionKey);
    const projection = useContext(ProjectionContext);
    const pathMaker = geoPath().projection(projection);

    return (<>
        {geographies.map((d,i)=><BaseElement.path key={`path-${i}`} d={pathMaker(d)} {...shapeProps(d)} />)};
            </>)
}