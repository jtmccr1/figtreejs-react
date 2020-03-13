import {ProjectionContext} from "./Map"
import {mapAttrsToProps} from "../../utils/baubleHelpers";
import {geoPath} from "d3-geo";
import React, {useContext,useCallback, useState} from "react";
import {useSpring,animated} from "react-spring"

export default function GreatCircleArc({start,stop,attrs,...restProps}){
    const attrMapper=mapAttrsToProps(attrs);
    const projection = useContext(ProjectionContext);
    const pathMaker = geoPath().projection(projection);

    const link = {type: "LineString", coordinates: [[start.long, start.lat], [stop.long, stop.lat]]} // Change these data to see ho the great circle reacts
    const offset = useSpring({ x: 100, from: { x: 0 } });
    return <path id={"test"} d={pathMaker(link)} {...attrs} strokeDashoffset={offset.x} />
}


export function PointsOnPath({start,stop,attrs,...restProps}){

    const [node,setNode] = useState(null);
   const measuredPath= useCallback(node => {
        if (node !== null) {
            setNode(node);
            console.log(node.getTotalLength())
        }
    }, []);

    // two children the path with ref and the points along the path
    return (
        <>
            <GreatCircleArc start={start} stop={stop} attrs={{strokeWidth:0,ref:measuredPath, fill:"none"}}/>
            {node &&
            <circle cx={node.getPointAtLength(0.5*node.getTotalLength()).x} cy={node.getPointAtLength(0.5*node.getTotalLength()).y} r={4}/>
            }
            </>
    )



}