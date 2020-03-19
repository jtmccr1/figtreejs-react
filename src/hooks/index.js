import {useCallback,useContext} from "react";
import {mapAttrsToProps} from "../utils/baubleHelpers";
import {DataContext, InteractionContext, ScaleContext} from "../Context/Context";

export function useAttributeMappers(props,hover,select){
    const { attrs, selectedAttrs, hoveredAttrs,interactions,tooltip} = props;
    const {scales}=useScales();
    const {state,dispatch} =useInteractions();
    const baseAttrMapper = useCallback(mapAttrsToProps((attrs?attrs:{}),scales), [attrs]);
    const selectedAttrMapper = useCallback(mapAttrsToProps((selectedAttrs?selectedAttrs:{}),scales), [selectedAttrs]);
    const hoveredAttrMapper = useCallback(mapAttrsToProps((hoveredAttrs?hoveredAttrs:{}),scales), [hoveredAttrs]);
    const tooltipMapper = useCallback(mapAttrsToProps((tooltip?tooltip:{}),scales),[tooltip]);

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

export  function useInteractions(){
    return useContext(InteractionContext)
}
export  function useScales(){
    return useContext(ScaleContext)
}
export function useData(){
    return useContext(DataContext);
}