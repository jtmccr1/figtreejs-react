import React, {useContext,useReducer} from "react";
import {defaultContextValues} from "../../Context/Context";

export default function withConditionalContextProvider(WrappedComponent,Context){

    return function(props){
        const value = useContext(Context);


        if(value===false){
            const {initialState,reducer}=defaultContextValues.get(Context);
            const [state,dispatch]=useReducer(reducer,initialState);

            return (
                <Context.Provider value = {{state,dispatch}}>
                    <WrappedComponent {...props}/>
                </Context.Provider>
            )
        }else{
            return <WrappedComponent {...props}/>
        }
    }



}