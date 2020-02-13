import React,{useMemo} from "react"
import Branch from "./Branch";
import BranchPath from "./BranchPath";
import {scaleLinear} from "d3-scale";
import {extent} from "d3-array";

export default function Branches(props){
    const {label,curvature,onHover,OnClick,edges,domain}=props;

    const xScale=useMemo(()=>scaleLinear().range([0,domain.x])
            .domain(extent(edges.reduce((acc,curr)=>{acc.push(curr.v0.x);acc.push(curr.v1.x);return acc},[]))),
        [edges,domain]);
    const yScale=useMemo(()=>scaleLinear().range([0,domain.y])
            .domain(extent(edges.reduce((acc,curr)=>{acc.push(curr.v0.y);acc.push(curr.v1.y);return acc},[]))),
        [edges,domain]);
    return(<g className={"branch-layer"}>
        {edges.map(e => {
            return (
                <Branch key={`branch-${e.id}`} classes={e.classes} x={xScale(e.x)} y={yScale(e.y)}>
                    <BranchPath {...{x0: xScale(e.v0.x), y0: yScale(e.v0.y), x1: xScale(e.v1.x), y1: yScale(e.v1.y)}}
                                strokeWidth={3} stroke={"black"}/>
                </Branch>
            )
        })
        }
        </g>)
        }

        Branches.defaultProps={
                label:{},
                curvature:{},
                onHover:{},
                onClick:{},
                attrs:{},
                edges:[],
            };