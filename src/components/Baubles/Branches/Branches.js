import React,{useMemo} from "react"
import Branch from "./Branch";
import BranchPath from "./BranchPath";
import {scaleLinear} from "d3-scale";
import {extent} from "d3-array";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";

export default function Branches(props){
    const {label,curvature,onHover,OnClick,edges,scales,attrs}=props;
    const attrMapper = useMemo (()=>mapAttrsToProps(attrs),[attrs]);

    return(<g className={"branch-layer"}>
        {edges.map(e => {
            return (
                <Branch key={`branch-${e.id}`} classes={e.classes} x={scales.x(e.x)} y={scales.y(e.y)}>
                    <BranchPath x0={scales.x(e.v0.x)} y0= {scales.y(e.v0.y)} x1={scales.x(e.v1.x)} y1={scales.y(e.v1.y)} {...attrMapper(e)} />
                </Branch>
            )
        })
        }
        </g>)
        }

        Branches.defaultProps={
                label:{},
                filter:(e)=>true,
                curvature:{},
                onHover:{},
                onClick:{},
                attrs:{},
                edges:[],
            };