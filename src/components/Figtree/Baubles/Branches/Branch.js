import {animated, useSpring} from "react-spring";
import React from "react";
import {areEqualShallow} from "../../../../utils/utilities";

const basicBranch = (props) =>{
    const {x,y,classes,interactions,id} = props;
    const position = useSpring({transform:`translate(${x},${y})`});

    return(
        <animated.g id={id} className={`branch ${classes.join(" ")} `} {...position} {...interactions} >
            {props.children}
        </animated.g>
    )
};

const Branch = React.memo(basicBranch,samesies);

export default Branch;

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