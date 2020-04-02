import React from "react";
import Branches from "../../components/Figtree/Baubles/Branches/Branches";
import Nodes from "../../components/Figtree/Baubles/Nodes/Nodes";
import NodeBackgrounds from "../../components/Figtree/Baubles/Nodes/NodeBackgrounds";
class Bauble{
    constructor(element){
        //TODO set as null and pass only those not null so react class handles defaults
        this._filter=(v)=>true;
        this._attrs={};
        this._selectedAttrs={};
        this._hoveredAttrs={};
        this.tooltip={};
        this._label=()=>false;
        this.element=element;
        this._hoverKey='id';
        this._interactions={};
    }


    attr(key,v){
        optionalDeepSetGet.call(this,"_attrs",key,v);
        return this;
    }
    hoveredAttr(key,v){
        return optionalDeepSetGet.call(this,"_hoveredAttrs",key,v);
    }
    selectedAttr(key,v){
        return optionalDeepSetGet.call(this,"_selectedAttrs",key,v);
    }
    filter(v){
        return optionalSetGet.call(this,"_filter",v)
    }
    hoverKey(v){
        return optionalSetGet.call(this,"_hoverKey",v)

    }
    interaction(key,v){
        return optionalDeepSetGet.call(this,"_interactions",key,v);
    }

    create(){
        return React.createElement(this.element,
            {attrs:this._attrs,selectedAttrs:this._selectedAttrs,hoveredAttrs:this._hoveredAttrs,filter:this._filter},
            null)
    }

}

export const branches ={rectangular: ()=> new Bauble(Branches.Rectangular),coalescent : ()=>new Bauble(Branches.Coalescent)};

export const nodes = {circle: ()=>new Bauble(Nodes.Circle),
    coalescent : ()=>new Bauble(Nodes.Coalescent),
    rectangle :()=> new Bauble(Nodes.Rectangle),
    animatedCircle:()=>new Bauble(Nodes.AnimatedCircleNodes)};

export const nodeBackgrounds = {circle: ()=>new Bauble(NodeBackgrounds.Circle),
    rectangle :()=> new Bauble(NodeBackgrounds.Rectangle)};


function optionalSetGet(key,value){
    if(value){
        this[key]=value;
        return this;
    }
    else{
        return this[key];
    }
};

function optionalDeepSetGet(key,innerKey,value){
    if(value){
        this[key][innerKey]=value;
        return this;
    }
    else{
        return this[key][innerKey];
    }
}