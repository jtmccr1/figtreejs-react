import React, {useContext,useMemo} from "react"
import {useSpring,animated} from "react-spring";
import {mapAttrsToProps} from "../../../utils/baubleHelpers";
import {NodeContext} from "../../FigTree";
import {TreeContext} from "../../FigTree";
import {getNode} from "../../..";
import {extent} from "d3-array";

export const CoalesenctNode =(props)=>{
    //HOC for node logic
    const tree = useContext(TreeContext);
    const {state,dispatch}=useContext(NodeContext);

    const { vertex,attrs,selectedAttrs,hoveredAttrs,layout} =props;
    const baseAttrMapper = useMemo(()=>mapAttrsToProps(attrs),[attrs]);
    const selectedAttrMapper = useMemo(()=>mapAttrsToProps(selectedAttrs),[selectedAttrs]);
    const hoveredAttrMapper = useMemo(()=>mapAttrsToProps(hoveredAttrs),[hoveredAttrs]);

    function attrMapper(v){
        let attrs=baseAttrMapper(v);
        if(state.hovered===v.id){
            attrs={...attrs,...hoveredAttrMapper(v)};
        }
        if(state.selected.includes(v.id)){
            attrs={...attrs,...selectedAttrMapper(v)};
        }
        return attrs;
    };

    // needs tree
    //TODO does this need to happen here? can I have a layout function that precalculates this inforamation.

    const node = getNode(tree,vertex.id);
    const vertices = layout(node).filter(v=>node.children.map(c=>c.id).includes(v.id));

    const extentY=extent(vertices,v=>v.y);
    const extentX=extent(vertices,v=>v.x);



    // needs layout function

    // coalescent Vertices have info about children
    // x,y x1,y1
    // x,y,x2,y2

    // get children vertices
    // make path

    let visibleProperties=attrMapper(vertex);
    visibleProperties= useSpring(visibleProperties);


    return (<animated.path className={"node-shape"} {...visibleProperties}
                             onMouseEnter={()=>dispatch({type:"hover",payload:vertex.id})}
                             onMouseLeave={()=>dispatch({type:"unhover"})}
                             onClick={()=>selectorLogic(state.selected,dispatch,vertex.id)}/>);

};


CoalesenctNode.defaultProps={
    attrs:{
        fill:"steelblue",
        strokeWidth:0,
        stroke:'black'},
    selectedAttrs:{},
    hoveredAttrs:{}
};

function selectorLogic(selection,dispatcher,vertexId){
    if(selection.length===1&&selection[0]===vertexId){

        dispatcher({type:"clearSelection"})
    }else{
        dispatcher({type:"select",payload:vertexId})
    }
}


