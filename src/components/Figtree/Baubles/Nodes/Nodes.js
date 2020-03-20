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
        console.log(scales.x.range());
        return (
            <>
                {reduceIterator(vertices.values(), (all, v) => {
                    if (filter(v)) {
                        const element = <Node  key={`node-${v.id}`} id={`node-${v.id}`} classes={v.classes} x={scales.x(v.x)} y={scales.y(v.y)}>
                                            <ShapeComponent {...shapeProps(v)} vertex={v}/>
                                            {React.Children.map(props.children,child=>React.cloneElement(child,{data:v,...child.props}))}
                                        </Node>;
                            all.push(element)
                    }
                    return all
                }, [])
                }
            </>
        )
    }
}

function selectorLogic(selection,dispatcher,vertexId){
    if(selection.length===1&&selection[0]===vertexId){

        dispatcher({type:"clearSelection"})
    }else{
        dispatcher({type:"select",payload:vertexId})
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





