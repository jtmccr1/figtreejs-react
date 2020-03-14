import React, {useContext} from 'react';

import {ProjectionContext} from "./Map"
import {mapAttrsToProps} from "../../utils/baubleHelpers";
import {geoPath} from "d3-geo";

export default function Features({geographies,attrs}){
    const attrMapper=mapAttrsToProps(attrs);
    const projection = useContext(ProjectionContext);
    const pathMaker = geoPath().projection(projection);

    return (<>
        {geographies.map((d,i)=><path key={`path-${i}`} d={pathMaker(d)} {...attrMapper(d)} />)};
            </>)
}