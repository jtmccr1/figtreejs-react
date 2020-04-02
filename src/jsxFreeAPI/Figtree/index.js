import React from "react";
import ReactDOM from "react-dom";
import FigTree from "../../components/Figtree/FigTree";


export default class figtree{
    constructor(svg=null,width=null,height,pos,tree=null){
        this.props = {width,height,pos,data:tree};
        this._svg=svg;
        this._children=[];
    }

    svg(s=undefined){
        return  optionalSetGet.call(this,"_svg",s)
    }

    pos(m=undefined){
        return  optionalDeepSetGet.call(this,"props","pos",m);
    }
    width(m=undefined){
        return  optionalDeepSetGet.call(this,"props","width",m);
    }
    height(m=undefined){
        return  optionalDeepSetGet.call(this,"props","height",m);
    }

    tree(t=undefined){
        return optionalDeepSetGet.call(this,"props","data",tree);
    }
    layout(l=undefined){
        return  optionalDeepSetGet.call(this,"props","layout",l);
    }

    nodes(){

    }

    nodeBackgrounds(){

    }

    branches(){

    }

    children(...child){
        this._children=this._children.concat(child.map(kid=>kid.create()));
        this.render();
        return this;
    }

    render(){

        if(this.svg()&&this.props.data&&this._children.length>0){
            console.log(this.props);
            ReactDOM.render(
                React.createElement(FigTree, {...this.props},...this._children ),
                this.svg())
        }
        return null;
    }
}

export function optionalSetGet(key,value){
    if(value){
        this[key]=value;
        this.render();
        return this;
    }
    else{
        return this[key];
    }
};

export function optionalDeepSetGet(key,innerKey,value){
    if(value!==null){
        this[key][innerKey]=value;
        this.render();
        return this;
    }
    else{
        return this[key][innerKey];
    }
}
