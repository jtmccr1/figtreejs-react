import {timeParse} from "d3-time-format";

import {
    orderByNodeDensity,
    rotate,
    collapseNodes,
    annotateNode,
} from "../../src/utils/Tree/treeOperations";
import {
    getDivergence,
    getNode,
    getParent,
    getRootToTipLengths,
    getTips, setLength,
} from "../../src/utils/Tree/treeSettersandGetters";
import {DataType} from "../../src/utils/utilities";
import {typeAnnotations} from "../../src/utils/Tree/parsing/treeParsingFunctions";
import {parseNewick} from "../../src";

const nexusString = `#NEXUS

Begin taxa;
\tDimensions ntax=4;
Taxlabels
\t'A'
\t'B'
\t'C'
\t'D'
;
END;

Begin TREES;
Translate
    1 A,
    2 B,
    3 C,
    4 D
    ;
tree TREE1 = [&R] ((4:1,(2:1,3:1):1):1,1:1);
END;
`;

const nexusStringNoTipMap = `#NEXUS

Begin taxa;
\tDimensions ntax=4;
Taxlabels
\t'A'
\t'B'
\t'C'
\t'D'
;
END;

Begin TREES;
tree TREE1 = [&R] (('D':1,('B':1,'C':1):1):1,'A':1);
END;
`;


const treeString="(('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob=0.8,location.set.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3,C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set.prob={1.0},location.set={\"Mabalako\"}]:4);"
describe("Tree Tests",()=>{


    test("Should get node",()=>{
       const tree = parseNewick("((a:1,B:1)internal:4E-5,c:3);");

        const expectedNode = { id: 'B',
            name: 'B',
            length: 1,
            annotations: {},
            annotationTypes: {} };

        expect(getNode(tree,"B")).toEqual(expectedNode);
    });

    test("Should get Parent",()=>{
        const tree = parseNewick("((a:1,B:1)internal:4E-5,c:3);");
        expect(getParent(tree,"a").id).toEqual("internal")
    });

    test("Should get tips",()=>{
        const tree = parseNewick(treeString);
        expect(getTips(getNode(tree,"node1"))).toEqual(["A|2020-01","B|1980-01-11"].map(id=>getNode(tree,id)))

    });
    test("Should order nodes",()=>{
        const s="((D:1,(B:1,C:1):1):1,A:1);";

        const tree = parseNewick(s);
        const orderedTree= orderByNodeDensity(tree,);


        expect(tree).not.toBe(orderedTree);

        expect(getNode(tree,"node2")).not.toBe(getNode(orderedTree,"node2"));
        expect(getParent(tree,"D")).not.toBe(getParent(orderedTree,"D"));

        expect(getNode(tree,"node3")).not.toBe(getNode(orderedTree,"node3"));
        expect(getNode(tree,"node1")).toBe(getNode(tree,"node1"));

        expect(getTips(tree).map(tip=>tip.id)).toEqual(["D","B","C","A"]);
        expect(getTips(orderedTree).map(tip=>tip.id)).toEqual(["B","C","D","A"]);
    });


    test("Should calculate root to tip lengths",()=>{
        const treeString= "((a:2,B:1)internal:0.5,c:3);";
        const tree = parseNewick(treeString);
        expect(getRootToTipLengths(tree)).toEqual([2.5,1.5,0.5,3,0])
    });

    test("test updating function",()=>{
        const s="((D:1,(B:1,C:1):1):1,A:1);";
        const tree = parseNewick(s);
        const newT = setLength(tree,"D",2);

        expect(getNode(newT,'D').length).toEqual(2);
        expect(newT).not.toBe(tree);
        expect(getParent(newT,"D")).not.toBe(getParent(tree,"D"));
        expect(getNode(newT,"D")).not.toBe(getNode(tree,"D"));
        expect(getNode(newT,"node2")).toBe(getParent(newT,"D"));
        expect(getNode(newT,"node1")).toBe(getNode(tree,"node1"))

    });


    test("collapse node",()=>{
        const s="((D:1,(B:1,C:1)0.3:1):1,A:1);";
        const tree = parseNewick(s,{labelName:"posterior"});

        const collapsedTree=collapseNodes(tree,(node)=>node.annotations.posterior && node.annotations.posterior <0.5);
        expect(getParent(collapsedTree,"D")).toBe(getParent(collapsedTree,"B"));
        expect(getNode(collapsedTree,"B").length).toEqual(getNode(tree,"B").length+getParent(tree,"B").length)
    });

    test("recursive collapse",()=>{
        const t={id:"1",children:[
                {id:2,length:1,p:0.1,children:[{id:"a",length:1},
                        {id:3,length:1,p:0.1,children:[{id:"a2",length:1},{id:"b",length:1}]}
                    ]},
                {id:"c",length:1}
            ]}
            expect(collapseNodes(t, n=>n.p<0.5).children.length).toEqual(4)
    });
    test("rotate Nodes",()=>{
        const s="((D:1,(B:1,C:1):1):1,A:1);";
        const tree = parseNewick(s);
        const rotatedTree=rotate(tree,getParent(tree,"D").id);
        expect(getNode(rotatedTree,getParent(tree,"D").id).children).toEqual([...getNode(tree,getParent(tree,"D").id).children].reverse())
    })

    test("annotate nodes",()=>{
        const s="((D:1,(B:1,C:1):1):1,A:1);";
        const tree = parseNewick(s);

        const annotatedTree= annotateNode(tree,"A",{"Host":"Bat"});

        expect(tree).not.toBe(annotatedTree);
        expect(getNode(tree,"B")).toBe(getNode(annotatedTree,"B"));
        expect(getNode(annotatedTree,"A").annotations).toEqual({Host:"Bat"});
        expect(getNode(annotatedTree,"A").annotationTypes).toEqual({Host:{type:DataType.DISCRETE,values: new Set(["Bat"])}});
        expect(annotatedTree.annotationTypes).toEqual({Host:{type:DataType.DISCRETE,values: new Set(["Bat"])}});
    })
    test("distinguish between quoted numbers and numbers",()=>{
        const s=`((D:1,(B:1,C:1):1)[&s="1",s_1=1]:1,A:1);`;
        const tree = parseNewick(s);
        expect(tree.annotationTypes).toEqual({s:{type:DataType.DISCRETE,values:new Set(["1"])}
            ,s_1:{type:DataType.INTEGER,extent:[1,1]}});
        expect(typeAnnotations({"string":"2","int":2})).toEqual({string:{type:DataType.DISCRETE,values: new Set(["2"])},int:{type:DataType.INTEGER,extent:[2,2]}})
    })


});

