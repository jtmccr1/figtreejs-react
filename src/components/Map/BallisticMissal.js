import {range} from "d3-array";
import {scaleLinear} from "d3-scale";
import {animated, useSprings} from "react-spring";

export default function BallisticMissal(props){

    const {relativeLength,maxWidth,node}=props;
    const numberOfsegments = 30;
    const path = node.getAttribute("d");
    const totalLength = node.getTotalLength();
    const missalLength = totalLength*relativeLength;
    const segmentLength= missalLength/numberOfsegments;


    function setOffset(i){
        return -1*(props.progress)*(totalLength+missalLength)+segmentLength+(i*segmentLength);
    }
    const segmentStyles = range(0,numberOfsegments).map(i=>({strokeDashoffset:setOffset(i),config:{friction:100}})); //-i*segmentLength
    const strokeWidthScale = scaleLinear().domain([0,numberOfsegments]).range([maxWidth,0]);
    const opacityScale = scaleLinear().domain([0,numberOfsegments]).range([1,0.5]);
    const springs = useSprings(segmentStyles.length, segmentStyles);

    // get path length
    // get length of missal
    // split into 10 groups with decreasing width and offsets

    return (springs.map((el,i)=><animated.path key={i} d={path} style={el} css={css`stroke-linecap:round; stroke-width:${strokeWidthScale(i)}; opacity:${opacityScale(i)}; stroke-dasharray:${segmentLength},${2*totalLength}; stroke:red;fill:none;`} />));

}
