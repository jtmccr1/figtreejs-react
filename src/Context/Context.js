import React from "react";
import interactionReducer,{initialState} from "./reducers/interactionReducer";

export const InteractionProvider = React.createContext(false);
const defaultInteractionContext= {initialState,reducer:interactionReducer};

export const defaultContextValues=new Map([[InteractionProvider,defaultInteractionContext]]);