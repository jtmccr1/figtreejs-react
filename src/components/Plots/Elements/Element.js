// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import {useAttributeMappers, useData, useScales} from "../../../hooks";
import React from "react";
//TODO animate g position
function withElementManagerHOC(ShapeComponent,hoverHelpers,selectionHelpers) {
    return function ElementManager(props) {
        const {scales} = useScales();
        const data = useData();
        const {filter,css} = props;
        const shapeProps = useAttributeMappers(props,hoverHelpers,selectionHelpers);
        function getGroupProps(d){
            return {
                css:props.css?css`${props.css}`:null,
                key:`g-${d.id}`,
                id:`node-${d.id}`,
                classes:d.classes?d.classes:null,
                transform:("x" in d && "y" in d)?`translate(${scales.x(d.x)},${scales.y(d.y)})`:null
            };
        }
        return (
            <>
                {data.reduce((all, d) => {
                    if (filter?filter(d):true) {
                        const element = <g {...getGroupProps(d)}>
                            <ShapeComponent {...shapeProps(d)} data={d}/>
                            {React.Children.map(props.children,child=>React.cloneElement(child,{data:d,...child.props}))}
                        </g>;
                        all.push(element)
                    }
                    return all
                }, [])
                }
            </>
        )
    }
}
function getGprops(d){
    return {
        css:props.css?css`${props.css}`:null,
        key:`g-${d.id}`,
        id:`node-${d.id}`,
        classes:d.classes?d.classes:null,
        transform:("x" in d && "y" in d)?`translate(${scales.x(d.x)},${scales.y(d.y)})`:null
    };
}

import BaseElements from "./BaseElements";
import {DataType} from "../../../utils/utilities";
const hoverHelpers = {predicate:hoverpredicate,actionCreator:hoverAction};
const selectionHelpers = {predicate:()=>false,actionCreator:()=>{}};
const Element = Object.keys(BaseElements).reduce((acc,key)=>{acc[key]=withElementManagerHOC(BaseElements[key],hoverHelpers,selectionHelpers);return acc},{});
export default Element;

function hoverAction(datum){
    return {type:"hover",payload:{type:DataType.DISCRETE,key:"id",value:datum.id}}
}


function hoverpredicate({hovered},datum){
    if(hovered.key==="id") {
        return datum.id === hovered.value;
    }
    if(hovered.key in datum.annotations) {
        return hovered.value===datum.annotations[hovered.key]
    }
    return false;
}

function nodeSelectionPredicate({selected},vertex){
    return false;
}