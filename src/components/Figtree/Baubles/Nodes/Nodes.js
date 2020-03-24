import React, {useMemo, useContext} from "react"
import Circle from "./Shapes/Circle";
import Node from "./Node";
import {LayoutContext} from "../../FigTree";
import {DataType, reduceIterator} from "../../../../utils/utilities";
import CoalescentShape from "./Shapes/CoalescentShape";
import {useAttributeMappers, useScales} from "../../../../hooks";

/**
 * This HOC takes a node shape and returns a shape for each vertex. It also handles converting
 * attributes that can be functions into display attributes that are passed to the shape.
 * @param ShapeComponent
 * @returns {function(*): *}
 * @constructor
 */

function NodesHOC(ShapeComponent) {
    return function Nodes(props) {
        const {scales} = useScales();
        const {vertices} = useContext(LayoutContext);
        const {filter,hoverKey,selectionKey} = props;
        const shapeProps = useAttributeMappers(props,hoverKey,selectionKey);
        return (
            <>
                {reduceIterator(vertices.values(), (all, v) => {
                    if (filter(v)) {
                        const element = <ShapeComponent key={v.id} {...shapeProps(v)} vertex={v}  x={scales.x(v.x)} y={scales.y(v.y)}/>
                            all.push(element)
                    }
                    return all
                }, [])
                }
            </>
        )
    }
}

const CircleNodes = NodesHOC(Circle);
CircleNodes.defaultProps={
    filter:(v)=>true,
    attrs:{r:2},
    selectedAttrs:{},
    hoveredAttrs:{},
    tooltip:{},
    label:()=>false,
};
const CoalescentNodes=NodesHOC(CoalescentShape);
CoalescentNodes.defualtProps={
    attrs: {
        fill: "steelblue",
        strokeWidth: 1,
        stroke: 'black'
    },
    tooltip:{},
};
const Nodes={Circle:CircleNodes,Coalescent:CoalescentNodes};
export default Nodes;





