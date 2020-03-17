import {
    hoverReducer,
    initialHovered,
    initialSelected,
    selectionReducer
} from "../../src/Context/reducers/interactionReducer";
import {DataType} from "../../src/utils/utilities";
describe("Tests hover reducer",()=>{
   test("hover on",()=>{
    const action={type:"hover",payload:{dataType:DataType.DISCRETE,key:"country",value:"USA"}};
    expect(hoverReducer(initialHovered,action)).toEqual({hovered:{dataType:DataType.DISCRETE,key:"country",value:"USA"}});
   })
    test("hover off",()=>{
        const action={type:"unhover",payload:{}};
        expect(hoverReducer({hovered:{dataType:DataType.DISCRETE,key:"country",value:"USA"}},action)).toEqual(initialHovered);
    })

});

describe("Test selection reducer",()=>{
    test("select",()=>{
        const id=Symbol("id");
        const action={type:"select",payload:{id:id,dataType:DataType.DISCRETE,key:"country",value:"USA"}}
        expect(selectionReducer(initialSelected,action)).toEqual({selected:{byId:{[id]:action.payload},all:[id]}})
    });
    test("deselect already selected",()=>{
        const id=Symbol("id");
        const action={type:"deselect",payload:{id:id,dataType:DataType.DISCRETE,key:"country",value:"USA"}};
        expect(selectionReducer({selected:{byId:{[id]:action.payload},all:[id]}},action)).toEqual(initialSelected)
    });
    test("clear selection",()=>{
        const id=Symbol("id");
        const action={type:"clear",payload:{}};
        expect(selectionReducer({selected:{byId:{[id]:action.payload},all:[id]}},action)).toEqual(initialSelected)
    });
    test("append selection",()=>{
        const id=Symbol("newSelection");
        const initialId = Symbol("initialId");
        const state = {selected:{
            byId:{[initialId]:{
                    id:initialId,
                    dataType:DataType.DISCRETE,
                    key:"country",
                    value:"USA"
                    }
            },
                all:[initialId]
        }};
        const action={type:"append selection",payload:{id:id,dataType:DataType.DISCRETE,key:"country",value:"UK"}};
        const newState={selected:{byId:{[initialId]:state.selected.byId[initialId],
                                        [id]:action.payload},
                                    all:[initialId,id]
            },
        };
        expect(selectionReducer(state,action)).toEqual(newState);
    });

});