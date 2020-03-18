import React, {useMemo} from "react"
import {mapAttrsToProps} from "../../utils/baubleHelpers";
import {DataType} from "../../utils/utilities";

export function withBaubleManagement(WrappedComponent,amIHovered=()=>false,amISelected=()=>false){
    return function BaubleManager(props){
        const {filter, attrs, selectedAttrs, hoveredAttrs,tooltip} = props;
        //TODO useCallback make custom hook?
        const baseAttrMapper = useMemo(() => mapAttrsToProps(attrs), [attrs]);
        const selectedAttrMapper = useMemo(() => mapAttrsToProps(selectedAttrs), [selectedAttrs]);
        const hoveredAttrMapper = useMemo(() => mapAttrsToProps(hoveredAttrs), [hoveredAttrs]);
        const tooltipMapper = useMemo(()=>mapAttrsToProps(tooltip),[tooltip]);

        function attrMapper(v) {
            let attrs = baseAttrMapper(v);
            if (amIhovered(state,v)) {
                attrs = {...attrs, ...hoveredAttrMapper(v)};
            }
            if (amIhovered(state,v)) {
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
            return {attrs: attrMapper(v), interactions: interactionMapper(v),tooltip:tooltipMapper(v)}
        }
    }

}