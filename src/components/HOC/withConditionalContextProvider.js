import React, {useContext} from "react";
import {defaultContextValues} from "../../Context/Context";

function withConditionalContextProvider(WrappedComponent,Context){

    return function(props){
        const value = useContext(Context);
        if(value===false){
            return (
                <Context.Provider value = {defaultContextValues.get(Context)}>
                    <WrappedComponent/>
                </Context.Provider>
            )
        }else{
            return <WrappedComponent {...props}/>
        }
    }



}