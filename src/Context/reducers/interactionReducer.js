import {produce} from "immer";
// const  initialState ={hovered:null,selected:[]};
export const initialSelected={selected:{byId:{},all:[]}};
export const initialFilters={filters:{byId:{},all:[]}};
export const initialHovered={hovered:{}};

export const initialState={...initialHovered,...initialSelected,...initialFilters};
export const hoverReducer = produce((draft,action)=>{
    switch (action.type) {
        case "hover":
            draft.hovered=action.payload;
            return;
        case "unhover":
            draft.hovered=initialHovered.hovered;
            return;
    }
},initialHovered);



export const selectionReducer =produce((draft,action)=>{
    switch(action.type){
        case "select":
            draft.selected.byId={[action.payload.id]:action.payload};
            draft.selected.all =[action.payload.id];
            return;
        case "deselect":
            delete draft.selected.byId[action.payload.id];
            draft.selected.all = draft.selected.all.filter(id=>id!==action.payload.id);
            return;
        case "append selection":
            draft.selected.byId[action.payload.id]=action.payload;
            draft.selected.all.push(action.payload.id);
            return;
        case "clear":
            draft.selected.byId= {};
            draft.selected.all=[];
            return;
    }
},initialSelected);

const  interactionReducer= (state,action)=> selectionReducer(hoverReducer(state,action),action);
export default interactionReducer;

export const interactionReducer1 = produce((draft,action)=>{
    switch(action.type){
        case "hover":
            draft.hovered=action.payload;
            break;
        case "select":
            draft.selected.byId[action.payload.id] =[action.payload];
            draft.seleteded.all.push(action.payload.id);
            break;
        case "filter":
            draft.f
    }
})




export const nodeReducer=produce((draft,action)=>{
    switch (action.type) {
        case "hover":
            draft.hovered=action.payload;
            break;
        case "unhover":
            draft.hovered="";
            break;
        case "appendSelection":
            draft.selected.push(action.payload);
            break;
        case "select":
            draft.selected=[action.payload];
            break;
        case "removeSelection":
            return draft.filter(s=>s!==action.payload);
        case "clearSelection":
            draft.selected =[];
    }
});


