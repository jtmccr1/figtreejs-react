import ImmutableCladeCollection, {mergeClade, treeReducer} from "../src/utils/immutableCladeCollection"
import {ImmutableTree} from "../src/utils/immutableTree";
import {Type} from "../src/utils/tree";

describe("Testing tree collection",()=>{
    const tree1String="((A[&rate=1]:2.1,B[&rate=1.1]:3)[&rate=1.5]:5,C[&rate=4]:1);";
    const tree2String="((A[&rate=1]:2,B[&rate=2]:3.4)[&rate=1]:6,C[&rate=3]:1);";

    const tipMap ={A:1,B:2,C:3};

    it("Should merge clade data",()=>{
        expect(mergeClade({trait1:[[1,2]],trait2:[1],count:1},
            {trait1:[[1,2]],trait2:[1],count:1})).toEqual({
            count:2,
            trait1:[[1,2],[1,2]],
            trait2:[1,1]
        })
    });



    it("Should make a collection from 1 tree",()=>{
        const tree = ImmutableTree.parseNewick(tree1String,{tipMap});
        const expectedOutput = {
            annotationTypes:{rate:{type:Type.FLOAT,extent:[1,4]}},
            cladesById:{
                "2":{
                    count:1,
                    length:[2.1],
                    rate:[1],
                },
                "4":{
                    count:1,
                    length:[3],
                    rate:[1.1],
                },
                "6":{
                    count:1,
                    length:[5],
                    rate:[1.5],
                },
                "8":{
                    count:1,
                    length:[1],
                    rate:[4],
                },
                "e":{
                    count:1,
                }
            },
            clades:["2","4","6","8","e"]
        };

        expect(treeReducer(tree)).toEqual(expectedOutput);
    });

    it("Should combine trees",()=>{
        const trees = [tree1String,tree2String].map(ts=>ImmutableTree.parseNewick(ts,{tipMap}));
        const collection = ImmutableCladeCollection.collectTrees(trees);
        const expectedOutput = {
            annotationTypes:{rate:{type:Type.FLOAT,extent:[1,4]}},
            cladesById:{
                "2":{
                    count:2,
                    length:[2.1,2],
                    rate:[1,1],
                },
                "4":{
                    count:2,
                    length:[3,3.4],
                    rate:[1.1,2]
                },
                "6":{
                    count:2,
                    length:[5,6],
                    rate:[1.5,1]
                },
                "8":{
                    count:2,
                    length:[1,1],
                    rate:[4,3]
                },
                "e":{
                    count:2,
                }
            },
            clades:["2","4","6","8","e"]
        };

        expect(collection).toEqual(expectedOutput);
    })
})