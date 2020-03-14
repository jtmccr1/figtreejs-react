// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import {ProjectionContext} from "./Map"
import {mapAttrsToProps} from "../../utils/baubleHelpers";
import {geoPath} from "d3-geo";
import {max, range} from "d3-array";
import React, {useContext,useCallback, useState,useEffect,useRef} from "react";
import {animated, useSprings, useSpring} from "react-spring"
import {scaleLinear} from "d3-scale";

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
            <MakePaths node={node} />
            }
            </>
    )



}
function MakePaths({node}) { //maybe just node
    const totalLength=node.getTotalLength();
    const [offset,setOffset] = useState(0);



    useEffect(()=>{
        setTimeout(()=>setOffset(1),2000)
    },[]);

    return BallisticMissal({length:0.5,maxWidth:5,node:node,offset:offset})
}

function BallisticMissal(props){

    const {length,maxWidth,node}=props;
    const numberOfsegments = 30;
    const path = node.getAttribute("d");
    const totalLength = node.getTotalLength();
    const missalLength = totalLength*length;
    const segmentLength= missalLength/numberOfsegments;

    function setOffset(i){
        return -1*(props.offset)*(totalLength+missalLength)+segmentLength+(i*segmentLength);
    }

    const segmentStyles = range(0,numberOfsegments).map(i=>({strokeDashoffset:setOffset(i)})); //-i*segmentLength
    console.log(range(0,numberOfsegments));
    console.log(segmentStyles);

    const strokeWidthScale = scaleLinear().domain([0,numberOfsegments]).range([maxWidth,0]);

    const springs = useSprings(segmentStyles.length, segmentStyles);

    // get path length
    // get length of missal
    // split into 10 groups with decreasing width and offsets

    return (springs.map((el,i)=><animated.path key={i} d={path} style={el} css={css`stroke-linecap:round; stroke-width:${strokeWidthScale(i)}; stroke-dasharray:${segmentLength},${2*totalLength}; stroke:red;fill:none;`} />));


}

