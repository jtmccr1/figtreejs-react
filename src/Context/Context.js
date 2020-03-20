import React from "react";
import {scaleLinear} from "d3-scale";

export const InteractionStateContext = React.createContext(false);
export const InteractionDispatchContext = React.createContext(false);
export const ScaleContext = React.createContext(
    {scales:{x:scaleLinear().domain([0,100]).range([0,300]),y:scaleLinear().domain([0,100]).range([0,300])},
        width:300,height:300
    });

export const DataContext = React.createContext([{x:1,y:1},{x:3,y:3}]);
