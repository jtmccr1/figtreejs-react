import React from "react"
import {animated, useSpring} from "react-spring";
import {areEqualShallow} from "../../../../utils/utilities";

/**
 * This positions a group at x,y with classes and calls a nodeShape with the remaining props.
 * @param props
 * @return {*}
 */
const basicNode =(props)=>{
    const {x,y,classes,id} = props;
    const position = useSpring({transform:`translate(${x},${y})`});
    return(
        <animated.g id={id} className={`node ${classes.join(" ")} `} {...position} >
            {props.children}
        </animated.g>
    )
};

function samesies(prev,curr){
    const prevChildrenAttrs = [].concat(React.Children.toArray(prev.children)[0]).map(child=>child.props.attrs);
    const currChildrenAttrs =[].concat(React.Children.toArray(curr.children)[0]).map(child=>child.props.attrs);
    const prevProps = {x:prev.x,y:prev.y};
    const currProps = {x:curr.x,y:curr.y};

    if(!areEqualShallow(prevProps,currProps)){
        return false;
    }
    if(prevChildrenAttrs.length!==currChildrenAttrs.length){
        return false
    }
    for (let i = 0; i < prevChildrenAttrs.length; i++) {
        if(!areEqualShallow(prevChildrenAttrs[i],currChildrenAttrs[i])){
            return false
        }
    }
    return true
    }

const Node = React.memo(basicNode,samesies);
// const Node=basicNode;
export default Node;

