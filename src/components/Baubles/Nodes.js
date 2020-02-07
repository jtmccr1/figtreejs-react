import React from "react"
import{useSpring,animated} from "react-spring";

export default function Nodes(props){
    // children will be set by the main settings and will be things like paths, text, ect. They will
    const {scales,vertices,tree} = props;

 return(
     <g className={"node-layer"}>
         {vertices.map(v=>{
             return ( <Node key={v.key} tree={tree} scales={scales} vertex={v}>
                            {props.children}
                        </Node>)
         })}
     </g>
 )

}


function Node(props){
    const {vertex,scales,tree} =props;
    const position = useSpring({transform:`translate(${scales.x(vertex.x)},${scales.y(vertex.y)})`});

    return(
        <animated.g className={`node ${vertex.classes.join(" ")} `} {...position} >
            {React.Children.map(props.children, (child, index) => {
                return React.cloneElement(child, {
                    vertex,
                    tree,
                });
            })}
        </animated.g>
    )
};