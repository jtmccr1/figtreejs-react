import {produce} from "immer";
// const  initialState ={hovered:null,selected:[]};

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


