import React from "react";
let counter =1;
const withLinearGradient =WrappedContainer=>{
    function WithLinearGradient(props){
        props = {...defaultProps(),...props};
        const {x1,x2,y1,y2,fillRamper,opacityRamper,n,...restProps} = props;
        const colorStops = [];
        for( let i=0;i<n;i++){
            const style={stopColor:fillRamper(i/(n-1)),stopOpacity:opacityRamper(i/(n-1))};
            colorStops.push( <stop key={i} offset={`${i/(n-1)}`} {...style}/>)
        }
        const idNumber = (counter+=1);
        restProps.attrs=restProps.attrs?{...restProps.attrs,fill:`url(#${idNumber})`}:{fill:`url(#grad${idNumber})`};
        return(
            <g>
                <defs>
                <linearGradient id={`grad${idNumber}`} x1={x1} y1={y1} x2={x2} y2={y2}>
                    {colorStops}
                </linearGradient>
            </defs>
                <WrappedContainer {...restProps} />
            </g>
        )
    }

    return WithLinearGradient;
};

function defaultProps(){
    return {
        x1:"0%",
        x2:"100%",
        y1:"0%",
        y2:"0%",
        n:10,
        fillRamper:i=>"grey",
        opacityRamper:i=>1
    }
}

export default withLinearGradient;