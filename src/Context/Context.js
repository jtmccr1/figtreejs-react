import React from "react";


export const InteractionProvider = React.createContext(false);
const state={};
const reducer=()=>true;
const defaultInteractionContext= {state,reducer};

export const defaultContextValues=new Map([[InteractionProvider,defaultInteractionContext]]);