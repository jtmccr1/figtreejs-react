import ImmutableTree from "../src/utils/immutableTree";
import {Type} from "../src/utils/tree";
import {timeParse} from "d3-time-format";

describe("Tree Tests",()=>{
    it("parse newick tree parse, type and reconcile annotations",()=>{
        const treeString="(('A|2020-01':1,B|1980-01-11[&length_range={1,1.5},location=\"Janesburgh\",location.prob={0.8,0.2},location.set={\"Janesburgh\",\"JanosAires\"}]:2):3,C|1960[&length_range={2,4},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"}]:4):120;"
        const tree = ImmutableTree.parseNewick(treeString,{datePrefix:"|"});

        expect(tree).toEqual({
            nodesById: {
                node2: {
                    id: 'node2',
                    name: null,
                    label: null,
                    length: 120,
                    children: ["node1", "C|1960"]
                },
                node1: {
                    id: 'node1',
                    name: null,
                    length: 3,
                    label: null,
                    children: ["A|2020-01", "B|1980-01-11"]
                },
                "C|1960": {
                    id: 'C|1960',
                    name: "C|1960",
                    length: 4,
                    label: null,
                    children: null
                },
                "A|2020-01": {
                    id: 'A|2020-01',
                    name: "A|2020-01",
                    length: 1,
                    label: null,
                    children: null
                },
                "B|1980-01-11": {
                    id: 'B|1980-01-11',
                    name: "B|1980-01-11",
                    length: 2,
                    label: null,
                    children: null
                }
            },
            annotationsById:{
                node2: {},
                node1: {},
                "C|1960": {
                    length_range:[2,4],
                    location:'Mabalako',
                    location_prob:1.0,
                    location_set:["Mabalako"],
                    location_probSet:{"Mabalako":1},
                    date:timeParse("%Y-%m-%d")("1960-06-15")
                },
                "A|2020-01": {
                    date:timeParse("%Y-%m-%d")("2020-01-15")
                },
                "B|1980-01-11": { length_range:[1,1.5],
                    location:'Janesburgh',
                    location_prob:[0.8,0.2],
                    location_set:["Janesburgh","JanosAires"],
                    location_probSet:{"Janesburgh":0.8,"JanosAires":0.2},
                    date:timeParse("%Y-%m-%d")("1980-01-11")
                }
            },
            annotationTypes:{
                length_range:{type:Type.FLOAT,extent:[1,4]},
                location:{type:Type.DISCRETE,values:new Set(["Janesburgh","Mabalako"])},
                location_prob:{type:Type.FLOAT,extent:[0.2,1]},
                location_set:{type:Type.DISCRETE,values:new Set(["Janesburgh","Mabalako"])},
                location_probSet:{type:Type.PROBABILITIES,values:[{"Janesburgh":0.8,"JanosAires":0.2},{"Mabalako":1}]},
                date:{type:Type.DATE,extent:[timeParse("%Y-%m-%d")("1960-06-15"),timeParse("%Y-%m-%d")("2020-01-15")]}
            }
        })
    })
});