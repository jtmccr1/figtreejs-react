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


function Branch(props){
    const {edge,scales} =props;
    const position = useSpring({transform:`translate(${scales.x(edge.x)},${scales.y(edge.y)})`});
    return(
        <animated.g key={edge.key} className={`branch ${edge.classes.join(" ")}`} {...position} >
            {React.Children.map(props.children, (child, index) => {
                return React.cloneElement(child, {
                    edge,
                    scales
                });
            })}
        </animated.g>
    )
};