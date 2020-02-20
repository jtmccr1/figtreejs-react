import React from 'react';
import {epanechnikov, kdeFactory} from "../../../utils/utilities";
import {scaleLinear} from "d3-scale";
import{range,extent,deviation,quantile} from "d3-array";
import {area,line} from "d3-shape";
import band from "d3-scale/src/band";

export default function KDE({data,height,width,kernel,numberOfThresholds,attrs,...props}){
    const x = scaleLinear().domain(extent(data)).range([0,width]);
    const y = scaleLinear().range([height,0]);
    const thresholdScale = scaleLinear().domain([0,numberOfThresholds]).range(x.domain());


    const bandwidth =0.9*Math.min(deviation(data),IQR(data)/1.34)*Math.pow(data.length,(-1/5));

    const thresholds = range(numberOfThresholds).map(t=>thresholdScale(t));
    const kde = kdeFactory(kernel(bandwidth))(thresholds);
    const estimate = kde(data);
    y.domain(extent(estimate.map(d=>d[1])));

    const areaD = area().x(d=>x(d[0])).y0(d=>y.range()[0]).y1(d=>y(d[1]));
    // const areaD = line().x(d=>x(d[0])).y(d=>y(d[1]));
    return (
        <g>
            <path d={areaD(estimate)} {...attrs}/>
            {props.children}
        </g>
    )

}

KDE.defaultProps={
    kernel:epanechnikov,
    numberOfThresholds:100,
    attrs:{stroke:"black",strokeWidth:2}
}

function IQR(data){
    return quantile(data,0.75)-quantile(data,0.25);
}