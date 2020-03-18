import {useCallback,useContext} from "react";
import {mapAttrsToProps} from "../utils/baubleHelpers";
import {InteractionContext, ScaleContext} from "../Context/Context";

export function useAttributeMappers(props,hover,select){
    const { attrs, selectedAttrs, hoveredAttrs,interactions,tooltip} = props;
    const {state,dispatch} =useInteractions();
    const baseAttrMapper = useCallback(mapAttrsToProps((attrs?attrs:{})), [attrs]);
    const selectedAttrMapper = useCallback(mapAttrsToProps(selectedAttrs?selectedAttrs:{}), [selectedAttrs]);
    const hoveredAttrMapper = useCallback(mapAttrsToProps((hoveredAttrs?hoveredAttrs:{})), [hoveredAttrs]);
    const tooltipMapper = useCallback(mapAttrsToProps(tooltip?tooltip:{}),[tooltip]);

    function attrMapper(dataEntry) {
        let attrs = baseAttrMapper(dataEntry);
        if (hover.predicate(state,dataEntry)) {
            attrs = {...attrs, ...hoveredAttrMapper(dataEntry)};
        }
        if (select.predicate(state,dataEntry)) {
            attrs = {...attrs, ...selectedAttrMapper(dataEntry)};
        }
        return attrs;
    };

    function interactionMapper(dataEntry) {
        const optionalInteractions = interactions?interactions:{};
        return {
            onMouseEnter: () => {
                if("onMouseEnter" in optionalInteractions){
                    interactions.onMouseEnter(dataEntry);
                }
                dispatch(hover.actionCreator(dataEntry))},
            onMouseLeave: () => {
                if("onMouseLeave" in optionalInteractions){
                    interactions.onMouseLeave(dataEntry);
                }
                dispatch({type:"unhover"})},
            onClick: () => {
                if("onClick" in optionalInteractions){
                    interactions.onClick(dataEntry);
                }
                dispatch(select.actionCreator(dataEntry))}
        }
    };
    return function shapeProps(dataEntry) {
        return {attrs: attrMapper(dataEntry), interactions: interactionMapper(dataEntry),tooltip:tooltipMapper(dataEntry)}
    }

}

function shapeProps(v) {
    return {attrs: attrMapper(v), interactions: interactionMapper(v),tooltip:tooltipMapper(v)}
}

export  function useInteractions(){
    return useContext(InteractionContext)
}
export  function useScales(){
    return useContext(ScaleContext)
}