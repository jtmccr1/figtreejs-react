import React, {useContext,useMemo} from "react"
import {sameAttributes} from "./Circle";
const Rectangle = React.memo( (props)=>{
    const {attrs,interactions,tooltip,...rest} = props;
    return (
        <rect {...tooltip}  className={"node-shape"} {...attrs} {...rest} {...interactions}/>
    );
},sameAttributes);


export default Rectangle;