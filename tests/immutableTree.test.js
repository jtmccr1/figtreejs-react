import {splitAtExposedCommas} from "../src/utils/Tree/immutableTree";
import {Type} from "../src/utils/Tree/immutableTree";
import {timeParse} from "d3-time-format";

import {parseNewick,orderByNodeDensity} from "../src/utils/Tree/treeOperations";
import {
    getDivergence,
    getNode,
    getParent,
    getRootToTipLengths,
    getTips
} from "../src/utils/Tree/treeSettersandGetters";

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
                    date: {type: Type.DATE, extent: [timeParse("%Y-%m-%d")("2020-01-15"), timeParse("%Y-%m-%d")("2020-01-15")]}
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
                    length_range: {type: Type.FLOAT, extent: [1, 1.5]},
                    location: {type: Type.DISCRETE, values: new Set(["Janesburgh"])},
                    location_prob: {type: Type.FLOAT, extent: [0.8, 0.8]},
                    location_probSet: {type: Type.PROBABILITIES, values: [{"Janesburgh": 0.8, "JanosAires": 0.2}]},
                    date: {type: Type.DATE, extent: [timeParse("%Y-%m-%d")("1980-01-11"), timeParse("%Y-%m-%d")("1980-01-11")]}
                }
            }],
        annotationTypes: {
            length_range: {type: Type.FLOAT, extent: [1, 1.5]},
            location: {type: Type.DISCRETE, values: new Set(["Janesburgh"])},
            location_prob: {type: Type.FLOAT, extent: [0.8, 0.8]},
            location_probSet: {type: Type.PROBABILITIES, values: [{"Janesburgh": 0.8, "JanosAires": 0.2}]},
            date: {type: Type.DATE, extent: [timeParse("%Y-%m-%d")("1980-01-11"), timeParse("%Y-%m-%d")("2020-01-15")]}
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
                length_range: {type: Type.INTEGER, extent: [2, 4]},
                location: {type: Type.DISCRETE, values: new Set(["Mabalako"])},
                location_prob: {type: Type.INTEGER, extent: [1,1]},
                location_probSet: {type: Type.PROBABILITIES, values: [{"Mabalako": 1}]},
                date: {type: Type.DATE, extent: [timeParse("%Y-%m-%d")("1960-06-15"), timeParse("%Y-%m-%d")("1960-06-15")]}
            }
        }],
    annotationTypes: {
        length_range: {type: Type.FLOAT, extent: [1, 4]},
        location: {type: Type.DISCRETE, values: new Set(["Janesburgh", "Mabalako"])},
        location_prob: {type: Type.FLOAT, extent: [0.8, 1]},
        location_probSet: {type: Type.PROBABILITIES, values: [ {"Janesburgh": 0.8, "JanosAires": 0.2},{"Mabalako": 1}]},
        date: {type: Type.DATE, extent: [timeParse("%Y-%m-%d")("1960-06-15"), timeParse("%Y-%m-%d")("2020-01-15")]}
    }
};
describe("Tree Tests",()=>{
    it("parse newick tree parse, type and reconcile annotations",()=>{
        const tree = parseNewick(treeString,{datePrefix:"|"});
        expect(tree).toEqual(expectedTree)
    });

    it("Should get node",()=>{
       const tree = parseNewick("((a:1,B:1)internal:4E-5,c:3);");

        const expectedNode = { id: 'B',
            name: 'B',
            length: 1,
            children: null,
            annotations: {},
            annotationTypes: {} };

        expect(getNode(tree,"B")).toEqual(expectedNode);
    });

    it("Should get Parent",()=>{
        const tree = parseNewick("((a:1,B:1)internal:4E-5,c:3);");
        expect(getParent(tree,"a").id).toEqual("internal")
    });
    it("Handle exponential terms in branch lengths and calc divergence",()=>{
        const treeString= "((a:1e-4,B:1)internal:4E-5,c:3);"
        const tree = parseNewick(treeString);

        expect(getDivergence(tree,getNode(tree,"a"))).toBeCloseTo(0.00014, 7);
    });

    it("Should get tips",()=>{
        const tree = parseNewick(treeString);
        expect(getTips(getNode(tree,"node1"))).toEqual(["A|2020-01","B|1980-01-11"].map(id=>getNode(tree,id)))

    });
    it("Should order nodes",()=>{
        const s="(d:1,(c:1,(((b1:1,b2:1):1,(b3:1,b4:1):1):1,(a3:1,(a1:1,a2:1):1):1):1):1);"

        const tree = parseNewick(s);
        const orderedTree= orderByNodeDensity(tree,false);

        expect(tree).not.toBe(orderedTree);
        expect(getParent(tree,"node7")).not.toBe(getParent(orderedTree,"node7"));
        expect(getParent(tree,"node6")).not.toBe(getParent(orderedTree,"node6"));
        expect(getParent(tree,"node5")).not.toBe(getParent(orderedTree,"node5"));

        expect(getNode(tree,"node3")).toBe(getNode(orderedTree,"node3"));
        expect(getNode(tree,"node2")).toBe(getNode(orderedTree,"node2"));
        expect(getNode(tree,"node1")).toBe(getNode(orderedTree,"node1"));


        expect(getTips(orderedTree).map(tip=>tip.id)).toEqual(["d","c","a3","a1","a2","b1","b2","b3","b4"]);
    });

    it("Should split string at exposed commas",()=>{
        const s = "('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3,C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4";
        expect(splitAtExposedCommas(s)).toEqual(["('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3","C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4"])
    });

    it("Should calculate root to tip lengths",()=>{
        const treeString= "((a:2,B:1)internal:0.5,c:3);"
        const tree = parseNewick(treeString);
        expect(getRootToTipLengths(tree)).toEqual([2.5,1.5,0.5,3,0])
    })
});

