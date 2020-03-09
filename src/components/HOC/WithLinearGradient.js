import React from "react";
let counter =1;
/**
 * This is an HOC that creates a linear gradient def and returns this def and the wrapped component with the def
 * applied.
 * @param WrappedContainer
 * @return {function(*): *}
 */
//TODO make possible to apply to a group of components so we don't need one per branch/node when they are the same.
const withLinearGradient =WrappedContainer=>{
    function WithLinearGradient(props){
        props = {...defaultProps(),...props};
        const {startingX,endingX,staringY,endingY,fillRamper,opacityRamper,n,gradientAttribute,attrs,...restProps} = props;
        const colorStops = [];
        for( let i=0;i<n;i++){
            const style={stopColor:fillRamper(i/(n-1)),stopOpacity:opacityRamper(i/(n-1))};
            colorStops.push( <stop key={i} offset={`${i/(n-1)}`} {...style}/>)
        }
        const idNumber = (counter+=1);
        const newAttrs =attrs?{...attrs,[gradientAttribute]:`url(#grad${idNumber})`}:{[gradientAttribute]:`url(#grad${idNumber})`};
        return(
            <g>
                <defs>
                <linearGradient id={`grad${idNumber}`} x1={startingX} y1={staringY} x2={endingX} y2={endingY}>
                    {colorStops}
                </linearGradient>
            </defs>
                <WrappedContainer {...restProps} attrs={newAttrs} />
            </g>
        )
    }
    return WithLinearGradient;
};

function defaultProps(){
    return {
        startingX:"0%",
        endingX:"100%",
        staringY:"0%",
        endingY:"0%",
        n:10,
        fillRamper:i=>"grey",
        opacityRamper:i=>1,
        gradientAttribute: "fill"
    }
}

export default withLinearGradient;