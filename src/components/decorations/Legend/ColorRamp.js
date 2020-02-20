import React from "react";
import withLinearGradient from "../../HOC/WithLinearGradient";


//TODO move to bauble
function Rect({width,height,attrs}){
    return  <rect width={width} height={height} {...attrs}/>
}
/** Color ramp
 *
 * This color ramp is inspired by the ramp used in https://observablehq.com/@d3/color-legend.
 * It takes a function whose input is between 0,1 and outputs a color. It uses this interpolator
 * to map the progress along a rectangle to a color gradient.
 * @param ramper
 * @param n
 * @param width
 * @param height
 * @return {*}
 * @constructor
 */
//TODO move to Legend
const ColorRamp = withLinearGradient(Rect);

export default ColorRamp;