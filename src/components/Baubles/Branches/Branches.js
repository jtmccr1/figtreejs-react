import React,{useMemo,useContext} from "react"
import Branch from "./Branch";
import BranchPath from "./BranchPath";

import {mapAttrsToProps} from "../../../utils/baubleHelpers";

import {ScaleContext} from "../../FigTree.js";
import {LayoutContext} from "../../FigTree";
import Node from "../Nodes/Node";

export default function Branches(props){

    const {scales} = useContext(ScaleContext);
    const {edges} = useContext(LayoutContext);
    const {attrs,filter}=props;
    const attrMapper = useMemo (()=>mapAttrsToProps(attrs),[attrs]);

    return(<g className={"branch-layer"}>
        {edges.filter(filter).map(e => {
            // const path = shape({x0:scales.x(e.v0.x), y0:scales.y(e.v0.y), x1:scales.x(e.v1.x), y1:scales.y(e.v1.y), ...attrMapper(e)});
            return (
                <Branch key={`branch-${e.id}`} classes={e.classes} x={scales.x(e.x)} y={scales.y(e.y)} >
                    {/*path*/}
                    {React.Children.map(props.children, child=>React.cloneElement(child,{x0:scales.x(e.v0.x), y0:scales.y(e.v0.y) ,x1:scales.x(e.v1.x), y1:scales.y(e.v1.y), ...attrMapper(e)}                        ))}
                </Branch>
            )
        })
        }
        </g>)
        }

        Branches.defaultProps={
                label:e=>'',
                filter:(e)=>true,
                onHover:null,
                onClick:null,
                attrs:{},
                edges:[],
                children:[<BranchPath  />],
                shape:shapeProps=><BranchPath {...shapeProps} />
            };