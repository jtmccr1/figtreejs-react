import React from "react"
import {animated, useSpring} from "react-spring";
import {areEqualShallow} from "../../../utils/utilities";

/**
 * This positions a group at x,y with classes and calls a nodeShape with the remaining props.
 * @param props
 * @return {*}
 */
const basicNode =(props)=>{
    const {x,y,classes} = props;
    const position = useSpring({transform:`translate(${x},${y})`});
    return(
        <animated.g className={`node ${classes.join(" ")} `} {...position} >
            {props.children}
        </animated.g>
    )
};

function samesies(prev,curr){
    const prevChildren = [].concat(prev.children).map(child=>child.props);
    const currChildren =[].concat(curr.children).map(child=>child.props);
    const prevProps = {x:prev.x,y:prev.y};
    const currProps = {x:curr.x,y:curr.y};

    if(!areEqualShallow(prevProps,currProps)){
        return false;
    }
    if(prevChildren.length!==currChildren.length){
        return false
    }
    for (let i = 0; i < prevChildren.length; i++) {
        if(!areEqualShallow(prevChildren[i],currChildren[i])){
            return false
        }
    }
    return true

    }

const Node = React.memo(basicNode,samesies);
// const Node=basicNode;
export default Node;

