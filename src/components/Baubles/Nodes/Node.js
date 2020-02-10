import React from "react"
import {animated, useSpring} from "react-spring";
import NodeShape from "./NodeShape";

/**
 * This positions a group at x,y with classes and calls a nodeShape with the remaining props.
 * @param props
 * @return {*}
 */
const basicNode =(props)=>{

    const {x,y,classes,interactions} = props;
    const position = useSpring({transform:`translate(${x},${y})`});

    return(
        <animated.g className={`node ${classes.join(" ")} `} {...position} {...interactions} >
            {props.children}
        </animated.g>
    )
};

function samesies(prev,curr){
// Will this work with
    const prevProps = {x:prev.x,y:prev.y,...prev.children.props};
    const currProps = {x:curr.x,y:curr.y,...curr.children.props};

    return areEqualShallow(prevProps,currProps)


}

const Node = React.memo(basicNode,samesies);

export default Node;

function areEqualShallow(a, b) {
    for(var key in a) {
        if(!(key in b) || a[key] !== b[key]) {
            return false;
        }
    }
    for(var key in b) {
        if(!(key in a) || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}