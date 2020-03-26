import {splitAtExposedCommas} from "../../src/utils/Tree/immutableTree";
import {timeParse} from "d3-time-format";

import {
    parseNewick,
    orderByNodeDensity,
    rotate,
    collapseUnsupportedNodes,
    annotateNode
} from "../../src/utils/Tree/treeOperations";
import {
    getDivergence,
    getNode,
    getParent,
    getRootToTipLengths,
    getTips, setLength,
} from "../../src/utils/Tree/treeSettersandGetters";
import {DataType} from "../../src/utils/utilities";
import {typeAnnotations} from "../../src/utils/Tree/treeParsingFunctions";

const treeString="(('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob=0.8,location.set.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3,C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set.prob={1.0},location.set={\"Mabalako\"}]:4);"
const expectedTree = {
    id: 'node2',
    name: null,
    length: null,
    annotations:{},
    children: [{
        id: 'node1',
        annotations:{},
        name: null,
        length: 3,
        children: [
            {
                id: 'A|2020-01',
                name: "A|2020-01",
                length: 1,
                children: null,
                annotations: {
                    date: timeParse("%Y-%m-%d")("2020-01-15")
                },
                annotationTypes:{
                    date: {type: DataType.DATE, extent: [timeParse("%Y-%m-%d")("2020-01-15"), timeParse("%Y-%m-%d")("2020-01-15")]}
                }
            },
            {
                id: 'B|1980-01-11',
                name: "B|1980-01-11",
                length: 2,
                children: null,
                annotations: {
                    length_range: [1, 1.5],
                    location: 'Janesburgh',
                    location_prob: 0.8,
                    location_probSet: {"Janesburgh": 0.8, "JanosAires": 0.2},
                    date: timeParse("%Y-%m-%d")("1980-01-11")
                },
                annotationTypes: {
                    length_range: {type: DataType.FLOAT, extent: [1, 1.5]},
                    location: {type: DataType.DISCRETE, values: new Set(["Janesburgh"])},
                    location_prob: {type: DataType.FLOAT, extent: [0.8, 0.8]},
                    location_probSet: {type: DataType.PROBABILITIES, values: [{"Janesburgh": 0.8, "JanosAires": 0.2}]},
                    date: {type: DataType.DATE, extent: [timeParse("%Y-%m-%d")("1980-01-11"), timeParse("%Y-%m-%d")("1980-01-11")]}
                }
            }],
        annotationTypes: {
            length_range: {type: DataType.FLOAT, extent: [1, 1.5]},
            location: {type: DataType.DISCRETE, values: new Set(["Janesburgh"])},
            location_prob: {type: DataType.FLOAT, extent: [0.8, 0.8]},
            location_probSet: {type: DataType.PROBABILITIES, values: [{"Janesburgh": 0.8, "JanosAires": 0.2}]},
            date: {type: DataType.DATE, extent: [timeParse("%Y-%m-%d")("1980-01-11"), timeParse("%Y-%m-%d")("2020-01-15")]}
        }
    },
        {
            id: 'C|1960',
            name: "C|1960",
            length: 4,
            children: null,
            annotations: {
                length_range: [2, 4],
                location: 'Mabalako',
                location_prob: 1.0,
                location_probSet: {"Mabalako": 1},
                date: timeParse("%Y-%m-%d")("1960-06-15")
            },
            annotationTypes: {
                length_range: {type: DataType.INTEGER, extent: [2, 4]},
                location: {type: DataType.DISCRETE, values: new Set(["Mabalako"])},
                location_prob: {type: DataType.INTEGER, extent: [1,1]},
                location_probSet: {type: DataType.PROBABILITIES, values: [{"Mabalako": 1}]},
                date: {type: DataType.DATE, extent: [timeParse("%Y-%m-%d")("1960-06-15"), timeParse("%Y-%m-%d")("1960-06-15")]}
            }
        }],
    annotationTypes: {
        length_range: {type: DataType.FLOAT, extent: [1, 4]},
        location: {type: DataType.DISCRETE, values: new Set(["Janesburgh", "Mabalako"])},
        location_prob: {type: DataType.FLOAT, extent: [0.8, 1]},
        location_probSet: {type: DataType.PROBABILITIES, values: [ {"Janesburgh": 0.8, "JanosAires": 0.2},{"Mabalako": 1}]},
        date: {type: DataType.DATE, extent: [timeParse("%Y-%m-%d")("1960-06-15"), timeParse("%Y-%m-%d")("2020-01-15")]}
    }
};
describe("Tree Tests",()=>{
    test("parse newick tree parse, type and reconcile annotations",()=>{
        const tree = parseNewick(treeString,{datePrefix:"|"});
        expect(tree).toEqual(expectedTree)
    });

    test("Should get node",()=>{
       const tree = parseNewick("((a:1,B:1)internal:4E-5,c:3);");

        const expectedNode = { id: 'B',
            name: 'B',
            length: 1,
            children: null,
            annotations: {},
            annotationTypes: {} };

        expect(getNode(tree,"B")).toEqual(expectedNode);
    });

    test("Should get Parent",()=>{
        const tree = parseNewick("((a:1,B:1)internal:4E-5,c:3);");
        expect(getParent(tree,"a").id).toEqual("internal")
    });
    test("Handle exponential terms in branch lengths and calc divergence",()=>{
        const treeString= "((a:1e-4,B:1)internal:4E-5,c:3);";
        const tree = parseNewick(treeString);

        expect(getDivergence(tree,getNode(tree,"a"))).toBeCloseTo(0.00014, 7);
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

    test("Should split string at exposed commas",()=>{
        const s = "('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3,C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4";
        expect(splitAtExposedCommas(s)).toEqual(["('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3","C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4"])
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

        const collapsedTree=collapseUnsupportedNodes(tree,(node)=>node.annotations.posterior && node.annotations.posterior <0.5);
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
            expect(collapseUnsupportedNodes(t,n=>n.p<0.5).children.length).toEqual(4)
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

        expect(typeAnnotations({"string":"2","int":2})).toEqual({string:{type:DataType.DISCRETE,values: new Set(["2"])},int:{type:DataType.INTEGER,extent:[2,2]}})
    })


});

