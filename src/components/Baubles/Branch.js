import {animated, useSpring} from "react-spring";

export default function Branch(props){
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