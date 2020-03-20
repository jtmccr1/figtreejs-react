import {useCallback,useContext} from "react";
import {mapAttrsToProps} from "../utils/baubleHelpers";
import {
    DataContext,
    InteractionContext,
    InteractionDispatchContext,
    InteractionStateContext,
    ScaleContext
} from "../Context/Context";
import {DataType} from "../utils/utilities";

export function useAttributeMappers(props,hoverKey="id",selectionKey="id"){
    const { attrs, selectedAttrs, hoveredAttrs,interactions,tooltip} = props;
    const {scales}=useScales();
    const {state,dispatch} =useInteractions();
    const baseAttrMapper = useCallback(mapAttrsToProps((attrs?attrs:{}),scales), [attrs]);
    const selectedAttrMapper = useCallback(mapAttrsToProps((selectedAttrs?selectedAttrs:{}),scales), [selectedAttrs]);
    const hoveredAttrMapper = useCallback(mapAttrsToProps((hoveredAttrs?hoveredAttrs:{}),scales), [hoveredAttrs]);
    const tooltipMapper = useCallback(mapAttrsToProps((tooltip?tooltip:{}),scales),[tooltip]);

    function attrMapper(dataEntry) {
        let attrs = baseAttrMapper(dataEntry);
        if (hoverPredicate(state,dataEntry)) {
            attrs = {...attrs, ...hoveredAttrMapper(dataEntry)};
        }
        // if (select.predicate(state,dataEntry)) {
        //     attrs = {...attrs, ...selectedAttrMapper(dataEntry)};
        // }
        return attrs;
    };

    function interactionMapper(dataEntry) {
        const optionalInteractions = interactions ? interactions : {};
        return {
            onMouseEnter: () => {
                if ("onMouseEnter" in optionalInteractions) {
                    interactions.onMouseEnter(dataEntry);
                }
                dispatch(hoverAction(dataEntry, hoverKey))
            },
            onMouseLeave: () => {
                if ("onMouseLeave" in optionalInteractions) {
                    interactions.onMouseLeave(dataEntry);
                }
                dispatch({type: "unhover"})
            },
            onClick: () => {
                if ("onClick" in optionalInteractions) {
                    interactions.onClick(dataEntry);
                }
                // dispatch(select.actionCreator(dataEntry))}
            }
        };
    }
    return function shapeProps(dataEntry) {
        return {attrs: attrMapper(dataEntry), interactions: interactionMapper(dataEntry),tooltip:tooltipMapper(dataEntry)}
    }

}

export  function useInteractions(){
    const state = useInteractionsState();
    const dispatch = useInteractionsDispatch();
    return {state,dispatch}
}
export function useInteractionsState(){
    return useContext(InteractionStateContext)
}
export function useInteractionsDispatch(){
    return useContext(InteractionDispatchContext)
}

export  function useScales(){
    return useContext(ScaleContext)
}
export function useData(){
    return useContext(DataContext);
}

function hoverAction(dataEntry,key){
    const value = key==="id"?dataEntry.id:dataEntry.annotations[key];
    return {type:"hover",payload:{type:DataType.DISCRETE,key:key,value:value}}
}

function hoverPredicate({hovered},dataEntry){
    if(hovered.key==="id") {
        return dataEntry.id === hovered.value;
    }
    if("annotations" in dataEntry){
        if(hovered.key in dataEntry.annotations) {
            return hovered.value===dataEntry.annotations[hovered.key]
        }
    }
    return false;
}