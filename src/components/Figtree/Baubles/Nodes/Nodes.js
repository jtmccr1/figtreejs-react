import React, {useMemo, useContext} from "react"
import {Circle,AnimatedCircle} from "./Shapes/Circle";
import Node from "./Node";
import {LayoutContext} from "../../FigTree";
import {DataType, reduceIterator} from "../../../../utils/utilities";
import CoalescentShape from "./Shapes/CoalescentShape";
import {useAttributeMappers, useScales} from "../../../../hooks";
import Rectangle from "./Shapes/Rectangle";

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
                {[...vertices.values()].sort((a,b)=>a.x-b.x).reduce( (all, v) => {
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
const AnimatedCircleNodes = NodesHOC(AnimatedCircle);
AnimatedCircleNodes.defaultProps={
    filter:(v)=>true,
    attrs:{r:2},
    selectedAttrs:{},
    hoveredAttrs:{},
    tooltip:{},
    label:()=>false,
};

const RectangularNodes = NodesHOC(Rectangle);
Rectangle.defualtProps={
    filter:(v)=>true,
    attrs:{width:10,height:5},
    selectedAttrs:{},
    hoveredAttrs:{},
    tooltip:{},
}


const CoalescentNodes=NodesHOC(CoalescentShape);
CoalescentNodes.defualtProps={
    attrs: {
        fill: "steelblue",
        strokeWidth: 1,
        stroke: 'black'
    },
    tooltip:{},
    filter:(v)=>true,
};
const Nodes={Circle:CircleNodes,Coalescent:CoalescentNodes,AnimatedCircleNodes:AnimatedCircleNodes,Rectangle:RectangularNodes};
export default Nodes;





