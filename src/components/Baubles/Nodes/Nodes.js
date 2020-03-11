import React, {useMemo, useContext} from "react"
import Circle from "./Shapes/Circle";
import Node from "./Node";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {LayoutContext, NodeContext, ScaleContext} from "../../FigTree";
import {reduceIterator} from "../../../utils/utilities";
import CoalescentShape from "./Shapes/CoalescentShape";

function NodesHOC(ShapeComponent) {
    return function Nodes(props) {
        const {scales} = useContext(ScaleContext);
        const {vertices} = useContext(LayoutContext);
        const {state, dispatch} = useContext(NodeContext);

        const {filter, className, attrs, selectedAttrs, hoveredAttrs} = props;

        const baseAttrMapper = useMemo(() => mapAttrsToProps(attrs), [attrs]);
        const selectedAttrMapper = useMemo(() => mapAttrsToProps(selectedAttrs), [selectedAttrs]);
        const hoveredAttrMapper = useMemo(() => mapAttrsToProps(hoveredAttrs), [hoveredAttrs]);


        function attrMapper(v) {
            let attrs = baseAttrMapper(v);
            if (state.hovered === v.id) {
                attrs = {...attrs, ...hoveredAttrMapper(v)};
            }
            if (state.selected.includes(v.id)) {
                attrs = {...attrs, ...selectedAttrMapper(v)};
            }
            return attrs;
        };

        function interactionMapper(v) {
            return {
                onMouseEnter: () => dispatch({type: "hover", payload: v.id}),
                onMouseLeave: () => dispatch({type: "unhover"}),
                onClick: () => selectorLogic(state.selected, dispatch, v.id)
            }
        }
        function shapeProps(v) {
            return {attrs: attrMapper(v), interactions: interactionMapper(v)}
        }
        return (
            <>
                {reduceIterator(vertices.values(), (all, v) => {
                    if (filter(v)) {
                        const element =  <Node key={`node-${v.id}`} classes={v.classes} x={scales.x(v.x)} y={scales.y(v.y)}>
                                            <ShapeComponent {...shapeProps(v)} vertex={v}/>
                                        </Node>;
                        if(v.id===state.hovered){
                            all.push(element)
                        }
                        else{
                            all.unshift(element)
                        }
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
    hoveredAttrs:{}
};
const CoalescentNodes=NodesHOC(CoalescentShape);
CoalescentNodes.defualtProps={
    attrs: {
        fill: "steelblue",
        strokeWidth: 1,
        stroke: 'black'
    },
};
const Nodes={Circle:CircleNodes,Coalescent:CoalescentNodes};
export default Nodes;
// Nested renders for selected and hovered nodes