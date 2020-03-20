import React from "react";
import withConditionalInteractionProvider from "./HOC/withConditionalInteractionProvider";
const JustChildren = (props)=><>{props.children}</>;
export default withConditionalInteractionProvider(JustChildren);
