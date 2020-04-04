import {getVertexClassesFromNode, makeVertexFromNode} from "../../src/utils/layouts/layoutHelpers";
import {getNode} from "../../src/utils/Tree/treeSettersandGetters";
import {makeEdges, rectangularLayout, rectangularVertices} from "../../src/utils/layouts";
import {parseNewick} from "../../src";
const tree = parseNewick("((A[&rate=0.9,host=\"bat\"]:2.1,B[&rate=1.1]:3)[&rate=1.5]:5,C[&rate=4]:1);");

describe("Testing layout helper functions",()=> {
    it("Should get classes", () => {
        expect(getVertexClassesFromNode(getNode(tree, "A"))).toEqual(["external-node", "host-bat"])
    });

    it("Should make vertex", () => {
        expect(makeVertexFromNode(getNode(tree, "A"), false).textLabel).toEqual({
            x: "12",
            y: "0",
            alignmentBaseline: "middle",
            textAnchor: "start",
        })
    });

    it("testing new layout style", () => {
        expect(rectangularLayout(tree).vertices[0]).toEqual({
            "classes": ["external-node", "host-bat"],
            "id": "A",
            "textLabel": {"alignmentBaseline": "middle", "textAnchor": "start", "x": "12", "y": "0"},
            "x": 7.1,
            "y": 0
        })
    });
    test( "Should make rectangular vertex", () => {
        expect(rectangularVertices(tree).get(getNode(tree,"A"))).toEqual({
            "classes": ["external-node", "host-bat"],
            "id": "A",
            "textLabel": {"alignmentBaseline": "middle", "textAnchor": "start", "x": "12", "y": "0"},
            "x": 7.1,
            "y": 0,
            annotations:getNode(tree,"A").annotations,
            node:getNode(tree,"A")
        })
    });

    it("Should make an edge", () => {
        const expected = [{x:5,y:0},{x:5,y:1},{x:0,y:0.5},{x:0,y:2},]
        const vertices=rectangularVertices(tree);
        expect(makeEdges(vertices).map(e=>({x:e.x,y:e.y}))).toEqual(expected)

    })
})