import React from "react"
import ReactDom from "react-dom";
import {LayoutContext,NodeContext} from "../Figtree/FigTree";

export default function ToolTip(props){
    const {domNode,renderPredicate} = props;

    if(renderPredicate){
        return ReactDOM.createPortal(
            props.children,
            domNode
        )
    }
    else{
        return null;
    }

}