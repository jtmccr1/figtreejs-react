// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import {ProjectionContext} from "./Map"
import {mapAttrsToProps} from "../../utils/baubleHelpers";
import {geoPath} from "d3-geo";
import React, {useContext,useCallback, useState,useEffect,useRef} from "react";
import makeBallistic from "../HOC/makeBallistic";

const GreatCircleArc= React.forwardRef((props, ref) => (

    const {start,stop,attrs,...restProps} = props;
    const attrMapper = mapAttrsToProps(attrs);
    const projection = useContext(ProjectionContext);
    const pathMaker = geoPath().projection(projection);
    const link = {type: "LineString", coordinates: [[start.long, start.lat], [stop.long, stop.lat]]} // Change these data to see ho the great circle reacts

    return <path {...attrs} d={pathMaker(link)} ref={ref}/>


));

export const GreatCircleArcMissal =makeBallistic(GreatCircleArc);




