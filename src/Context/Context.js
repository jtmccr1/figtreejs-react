import React from "react";
import interactionReducer,{initialState} from "./reducers/interactionReducer";
import {scaleLinear} from "d3-scale";

export const InteractionContext = React.createContext(false);
export const ScaleContext = React.createContext(
    {scales:{x:scaleLinear().domain([0,100]).range([0,230]),y:scaleLinear().domain([0,100]).range([0,240])},
        width:300,height:300
    });


const defaultInteractionContext= {initialState,reducer:interactionReducer};

export const defaultContextValues=new Map([[InteractionContext,defaultInteractionContext]]);