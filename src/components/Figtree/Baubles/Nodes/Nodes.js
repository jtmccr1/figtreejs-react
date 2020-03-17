import React, {useMemo, useContext} from "react"
import Circle from "./Shapes/Circle";
import Node from "./Node";
import {mapAttrsToProps} from "../../../../utils/baubleHelpers";
import {LayoutContext, ScaleContext} from "../../FigTree";
import {DataType, reduceIterator} from "../../../../utils/utilities";
import CoalescentShape from "./Shapes/CoalescentShape";
import {InteractionProvider} from "../../../../Context/Context";

function NodesHOC(ShapeComponent) {
    return function Nodes(props) {
        const {scales} = useContext(ScaleContext);
        const {vertices} = useContext(LayoutContext);
        const {state, dispatch} = useContext(InteractionProvider);
        const {filter, attrs, selectedAttrs, hoveredAttrs} = props;

        const baseAttrMapper = useMemo(() => mapAttrsToProps(attrs), [attrs]);
        const selectedAttrMapper = useMemo(() => mapAttrsToProps(selectedAttrs), [selectedAttrs]);
        const hoveredAttrMapper = useMemo(() => mapAttrsToProps(hoveredAttrs), [hoveredAttrs]);

        function attrMapper(v) {
            let attrs = baseAttrMapper(v);
            if (nodeHoverHelper(state,v)) {
                attrs = {...attrs, ...hoveredAttrMapper(v)};
            }
            if (nodeSelectionHelper(state,v)) {
                attrs = {...attrs, ...selectedAttrMapper(v)};
            }
            return attrs;
        };

        function interactionMapper(v) {
            return {
                onMouseEnter: () => dispatch({type: "hover", payload:{type:DataType.DISCRETE,key:"id",value:v.id}}),
                onMouseLeave: () => dispatch({type: "unhover"}),
                // onClick: () => selectorLogic(state.selected, dispatch, v.id)
            }
        }
        function shapeProps(v) {
            return {attrs: attrMapper(v), interactions: interactionMapper(v)}
        }
        return (
            <>
                {reduceIterator(vertices.values(), (all, v) => {
                    if (filter(v)) {
                        const element = <Node key={`node-${v.id}`} id={`node-${v.id}`}classes={v.classes} x={scales.x(v.x)} y={scales.y(v.y)}>
                                            <ShapeComponent {...shapeProps(v)} vertex={v}/>
                                        </Node>
                                        ;
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



function nodeHoverHelper({hovered},vertex){
    if(hovered.key==="id") {
        return vertex.id === hovered.value;
    }
    if(hovered.key in vertex.node.annotations) {
        return hovered.value===vertex.node.annotations[hovered.key]
    }
    return false;
}

function nodeSelectionHelper({selected},vertex){
    return false;
}

