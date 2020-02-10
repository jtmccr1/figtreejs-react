import {animated, useSpring} from "react-spring";
import React from "react";
import {areEqualShallow} from "../../../utils/utilities";

const basicBranch = (props) =>{
    const {x,y,classes,interactions} = props;
    const position = useSpring({transform:`translate(${x},${y})`});
    return(
        <animated.g className={`branch ${classes.join(" ")} `} {...position} {...interactions} >
            {props.children}
        </animated.g>
    )
};

const Branch = React.memo(basicBranch,samesies);

export default Branch;

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