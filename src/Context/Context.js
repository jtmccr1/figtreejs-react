import React from "react";
import {scaleLinear} from "d3-scale";
import {parseNewick} from "../utils/Tree/treeOperations";

export const InteractionStateContext = React.createContext(false);
export const InteractionDispatchContext = React.createContext(false);
export const ScaleContext = React.createContext(
    {scales:{x:scaleLinear().domain([0,100]).range([0,300]),y:scaleLinear().domain([0,100]).range([0,300])},
        width:300,height:300
    });

export const DataContext = React.createContext([{x:1,y:1},{x:3,y:3}]);
export const TreeContext = React.createContext(parseNewick(    '((((((virus1:0.1,virus2:0.12)0.95:0.08,(virus3:0.011,virus4:0.0087)1.0:0.15)0.65:0.03,virus5:0.21)1.0:0.2,(virus6:0.45,virus7:0.4)0.51:0.02)1.0:0.1,virus8:0.4)1.0:0.1,(virus9:0.04,virus10:0.03)1.0:0.6);'));
export const LayoutContext = React.createContext({vertices:new Map(),edges:[]});