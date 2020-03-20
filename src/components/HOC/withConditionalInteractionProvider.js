import React, {useContext,useReducer} from "react";
import {InteractionDispatchContext,InteractionStateContext} from "../../Context/Context";
import {useInteractionsState} from "../../hooks";
import interactionReducer, {initialState} from "../../Context/reducers/interactionReducer";

export default function withConditionalInteractionProvider(WrappedComponent){

    return function(props){
        const value = useInteractionsState();

        if(value===false){
            const [state,dispatch]=useReducer(interactionReducer,initialState);

            return (
                <InteractionStateContext.Provider value = {state}>
                    <InteractionDispatchContext.Provider value ={dispatch}>
                    <WrappedComponent {...props}/>
                    </InteractionDispatchContext.Provider>
                </InteractionStateContext.Provider>
            )
        }else{
            return <WrappedComponent {...props}/>
        }
    }



}