import {splitAtExposedCommas} from "../../src/utils/Tree/immutableTree";
import {timeParse} from "d3-time-format";

import {
    getDivergence,
    getNode,
    getParent,

    getTips, setLength,
} from "../../src/utils/Tree/treeSettersandGetters";
import {DataType} from "../../src/utils/utilities";
import {typeAnnotations, splitNexusString,readExternalNode,parseNewick
} from "../../src/utils/Tree/treeParsingFunctions";

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
const expectedTree = {
    id: 'node2',
    annotations:{},
    children: [{
        id: 'node1',
        annotations:{},
        length: 3,
        children: [
            {
                id: 'A|2020-01',
                name: "A|2020-01",
                length: 1,
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
describe("Tree Parsing Tests",()=>{

    test("parse external node with quotes",()=>{
        const tipFrag=`'Da tip':1,('`.split("");
        const {label,comment}= readExternalNode(tipFrag);
        expect(label).toEqual("Da tip");
        expect(comment).toEqual(null);
    })
    test("parse external node with comment",()=>{
        const tipFrag=`Datip[&comment=1]:1,('`.split("");
        const {label,comment}= readExternalNode(tipFrag);
        expect(label).toEqual("Datip");
        expect(comment).toEqual("&comment=1");
    })


    test("parse newick tree parse, type and reconcile annotations",()=>{
        const tree = parseNewick(treeString,{datePrefix:"|"});
        expect(tree).toEqual(expectedTree)
    });

    test("split nexus string",()=>{
        const tokens = splitNexusString("#NEXUS\nBegin test;\n databegin ;\n END;\nBegin test2;\ndata2 ;\nEND;")

        expect(tokens).toEqual(["#NEXUS","test;\n databegin ;","test2;\ndata2 ;"])
    })

    test("parse nexus tree",()=>{
        const tree=parseNexus(nexusString)[0];
        const newickTree = parseNewick("((D:1,(B:1,C:1):1):1,A:1);");
        expect(tree).toEqual(newickTree)
    })

    test("parse nexus tree no tip map ",()=>{
        const tree=parseNexus(nexusStringNoTipMap)[0];
        const newickTree = parseNewick("((D:1,(B:1,C:1):1):1,A:1);");
        expect(tree).toEqual(newickTree)
    })

    test("Handle exponential terms in branch lengths and calc divergence",()=>{
        const treeString= "((a:1e-4,B:1)internal:4E-5,c:3);";
        const tree = parseNewick(treeString);

        expect(getDivergence(tree,getNode(tree,"a"))).toBeCloseTo(0.00014, 7);
    });

    test("Should split string at exposed commas",()=>{
        const s = "('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3,C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4";
        expect(splitAtExposedCommas(s)).toEqual(["('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3","C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4"])
    });

    test("rotate Nodes",()=>{
        const s="((D:1,(B:1,C:1):1):1,A:1);";
        const tree = parseNewick(s);
        const rotatedTree=rotate(tree,getParent(tree,"D").id);
        expect(getNode(rotatedTree,getParent(tree,"D").id).children).toEqual([...getNode(tree,getParent(tree,"D").id).children].reverse())
    })
    test("distinguish between quoted numbers and numbers",()=>{
        const s=`((D:1,(B:1,C:1):1)[&s="1",s_1=1]:1,A:1);`;
        const tree = parseNewick(s);
        expect(tree.annotationTypes).toEqual({s:{type:DataType.DISCRETE,values:new Set(["1"])}
            ,s_1:{type:DataType.INTEGER,extent:[1,1]}});
        expect(typeAnnotations({"string":"2","int":2})).toEqual({string:{type:DataType.DISCRETE,values: new Set(["2"])},int:{type:DataType.INTEGER,extent:[2,2]}})
    })


});

