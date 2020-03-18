import React from "react";
import withConditionalContextProvider from "./HOC/withConditionalContextProvider";
import {InteractionContext} from "../Context/Context";
const JustChildren = (props)=><>{props.children}</>;
export default withConditionalContextProvider(JustChildren,InteractionContext);
