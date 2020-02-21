import {splitAtExposedCommas, ImmutableTree} from "../src/utils/immutableTree";
import {Type} from "../src/utils/immutableTree";
import {timeParse} from "d3-time-format";
import * as matchers from 'jest-immutable-matchers';
import {fromJS} from "immutable";

const treeString="(('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob=0.8,location.set.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3,C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set.prob={1.0},location.set={\"Mabalako\"}]:4);"
const expectedTree = {
    root: "node2",
    nodesById: {
        node2: {
            id: 'node2',
            name: null,
            length: null,
            children: ["node1", "C|1960"],
            clade: "7",
            postOrder: 4,
        },
        node1: {
            id: 'node1',
            name: null,
            length: 3,
            children: ["A|2020-01", "B|1980-01-11"],
            clade: '3',
            postOrder: 2,
            parent: "node2"
        },
        "C|1960": {
            id: 'C|1960',
            name: "C|1960",
            length: 4,
            children: null,
            clade: '4',
            postOrder: 3,
            parent: "node2"
        },
        "A|2020-01": {
            id: 'A|2020-01',
            name: "A|2020-01",
            length: 1,
            children: null,
            clade: '1',
            postOrder: 0,
            parent: "node1"
        },
        "B|1980-01-11": {
            id: 'B|1980-01-11',
            name: "B|1980-01-11",
            length: 2,
            children: null,
            clade: "2",
            postOrder: 1,
            parent: "node1"
        }
    },
    cladeMap: {
        "1": "A|2020-01",
        "2": "B|1980-01-11",
        "4": "C|1960",
        "3": "node1",
        "7": "node2",
    },
    clades: ["1", "2", "3", "4", "7"],
    externalNodes: ["A|2020-01", "B|1980-01-11", "C|1960"],
    internalNodes: ["node2", "node1"],
    postOrder: ["A|2020-01", "B|1980-01-11", "node1", "C|1960", "node2"],
    annotationsById: {
        node2: {},
        node1: {},
        "C|1960": {
            length_range: [2, 4],
            location: 'Mabalako',
            location_prob: 1.0,
            location_probSet: {"Mabalako": 1},
            date: timeParse("%Y-%m-%d")("1960-06-15")
        },
        "A|2020-01": {
            date: timeParse("%Y-%m-%d")("2020-01-15")
        },
        "B|1980-01-11": {
            length_range: [1, 1.5],
            location: 'Janesburgh',
            location_prob: 0.8,
            location_probSet: {"Janesburgh": 0.8, "JanosAires": 0.2},
            date: timeParse("%Y-%m-%d")("1980-01-11")
        }
    },
    annotationTypes: {
        length_range: {type: Type.FLOAT, extent: [1, 4]},
        location: {type: Type.DISCRETE, values: new Set(["Janesburgh", "Mabalako"])},
        location_prob: {type: Type.FLOAT, extent: [0.8, 1]},
        location_probSet: {type: Type.PROBABILITIES, values: [{"Janesburgh": 0.8, "JanosAires": 0.2}, {"Mabalako": 1}]},
        date: {type: Type.DATE, extent: [timeParse("%Y-%m-%d")("1960-06-15"), timeParse("%Y-%m-%d")("2020-01-15")]}
    }
};
describe("Tree Tests",()=>{
    beforeEach(function () {
        jest.addMatchers(matchers);
    });
    it("parse newick tree parse, type and reconcile annotations",()=>{
        const tree = ImmutableTree.parseNewick(treeString,{datePrefix:"|"});

        expect(tree.get("root")).toEqual("node2");
        expect(tree.get("nodesById")).toEqualImmutable(fromJS(expectedTree.nodesById));
        expect(tree.get("clades")).toEqualImmutable(fromJS(expectedTree.clades));
        expect(tree.get("externalNodes")).toEqualImmutable(fromJS(expectedTree.externalNodes));
        expect(tree.get("postOrder")).toEqualImmutable(fromJS(expectedTree.postOrder));
        expect(tree.get("internalNodes")).toEqualImmutable(fromJS(expectedTree.internalNodes));
        expect(tree.get("annotationsById")).toEqualImmutable(fromJS(expectedTree.annotationsById));
        // expect(tree.get("annotationTypes")).toEqualImmutable(fromJS(expectedTree.annotationTypes));
        // expect(tree).toEqualImmutable(fromJS(expectedTree))
    });
    it("Handle exponential terms in branch lengths",()=>{
        const treeString= "((a:1e-4,B:1)internal:4E-5,c:3);"
        const tree = new ImmutableTree(ImmutableTree.parseNewick(treeString));

        expect(tree.getDivergence("a")).toBeCloseTo(0.00014, 7);
    });

    it("Should calculate divergence",()=>{
        const tree = new ImmutableTree(ImmutableTree.parseNewick(treeString));

        expect(tree.getDivergence("A|2020-01")).toEqual(4)
    });
    it("Should calculate height",()=>{
        const tree = new ImmutableTree(ImmutableTree.parseNewick(treeString));

        expect(tree.getHeight("A|2020-01")).toEqual(1)

    });
    it("Should order nodes",()=>{
        const tree = new ImmutableTree(ImmutableTree.parseNewick(treeString));

        tree.orderByNodeDensity();

        expect(tree.getExternalNodes()).toEqual(["C|1960","A|2020-01","B|1980-01-11"]);
        tree.orderByNodeDensity(false);
        expect(tree.getExternalNodes()).toEqual(["A|2020-01","B|1980-01-11","C|1960"]);



    });

    it("Should split string at exposed commas",()=>{
        const s = "('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3,C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4";
        expect(splitAtExposedCommas(s)).toEqual(["('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3","C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4"])
    });

/*    it("Should calculate root to tip lengths",()=>{
        const newickString =
            '((((((virus1:0.1,virus2:0.12)0.95:0.08,(virus3:0.011,virus4:0.0087)1.0:0.15)0.65:0.03,virus5:0.21)1.0:0.2,(virus6:0.45,virus7:0.4)0.51:0.02)1.0:0.1,virus8:0.4)1.0:0.1,(virus9:0.04,virus10:0.03)1.0:0.6);';
        const treeData = ImmutableTree.parseNewick(newickString);
        const tree = new ImmutableTree(treeData);

        expect(tree.getRootToTipLengths()).toEqual()
    })*/
});

