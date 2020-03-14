// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import {ProjectionContext} from "./Map"
import {mapAttrsToProps} from "../../utils/baubleHelpers";
import {geoPath} from "d3-geo";
import {range} from "d3-array";
import React, {useContext,useCallback, useState,useEffect,useRef} from "react";
import {useSpring, useChain,animated, useTrail} from "react-spring"

export default function GreatCircleArc({start,stop,attrs,...restProps}) {
    const attrMapper = mapAttrsToProps(attrs);
    const projection = useContext(ProjectionContext);
    const pathMaker = geoPath().projection(projection);

    const link = {type: "LineString", coordinates: [[start.long, start.lat], [stop.long, stop.lat]]} // Change these data to see ho the great circle reacts


    return (
            <path
                {...attrs}
                d={pathMaker(link)}/>

    )

}

// given a path layout points along that path
// animate stroke-width of points

export function PointsOnPath({start,stop,attrs,...restProps}){

    const [node,setNode] = useState(null);
   const measuredPath= useCallback(node => {
        if (node !== null) {
            setNode(node);
            console.log(node)
        }
    }, []);

    const projection = useContext(ProjectionContext);
    const pathMaker = geoPath().projection(projection);

    const link = {type: "LineString", coordinates: [[start.long, start.lat], [stop.long, stop.lat]]} // Change these data to see ho the great circle reacts

    // two children the path with ref and the points along the path
    return (
        <>
            <GreatCircleArc start={start} stop={stop} attrs={{strokeWidth:0,ref:measuredPath, fill:"none"}}/>
            {node &&
            <MakePaths node={node} path={pathMaker(link)} />
            }
            </>
    )



}
function MakePaths({node,path}) { //maybe just node
    const totalLength=node.getTotalLength();
    const [go,setGo] = useState(false);
    const head = useTrail(30,{
        strokeWidth:go?5:0,
    });



    useEffect(()=>{
        setTimeout(()=>setGo(true),2000)
    },[]);

    return head.map(({strokeWidth},i)=><animated.path key={i} strokeWidth={strokeWidth} d={path} css={css`stroke-linecap:round; stroke-dasharray:${totalLength/30},${totalLength}; stroke-dashoffset:${(i/30)*-1*totalLength}; stroke:red;fill:none;`} />)
}

