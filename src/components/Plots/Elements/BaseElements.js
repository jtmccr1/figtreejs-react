import React, {useContext,useMemo} from "react"
import {useSpring,animated} from "react-spring";
import {sameAttributes} from "../../Figtree/Baubles/Nodes/Shapes/Circle";
//TODO animate path d with did
function withElemental(AnimatedComponent){
    return React.memo(function withElemental(props){
        const {attrs,interactions,tooltip,...rest} = props;
        const visibleProperties= useSpring(attrs);
        return (
            <AnimatedComponent {...tooltip}  {...visibleProperties} {...interactions} {...rest}/>
        );
    }, sameAttributes)
}

const Path = withElemental(animated.path);
const Circle = withElemental(animated.circle);
const Rect= withElemental(animated.rect);

//TODO set up default props and memoization

export default {path:Path,circle:Circle,rect:Rect};
