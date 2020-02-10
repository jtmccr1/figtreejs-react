import React from "react"
import {useSpring,animated} from "react-spring";

export default function Branches(props){
    const{edges}=props;
    const {scales} = props;

    return(
        <g className={"branch-layer"}>
            {edges.map(e=>{
                return (<Branch key={e.key} scales={scales} edge={e}>
                    {props.children}
                </Branch>
                )})
            }
        </g>

    )

}


