import {getVertexClassesFromNode, makeVertexFromNode} from "../src/utils/layouts/layoutHelpers";
import {parseNewick} from "../src/utils/Tree/treeOperations";
import {getNode} from "../src/utils/Tree/treeSettersandGetters";
import {rectangularLayout} from "../src/utils/layouts/index";
const tree = parseNewick("((A[&rate=0.9,host=\"bat\"]:2.1,B[&rate=1.1]:3)[&rate=1.5]:5,C[&rate=4]:1);");

describe("Testing layout helper functions",()=> {
    it("Should get classes", () => {
        expect(getVertexClassesFromNode(getNode(tree, "A"))).toEqual(["external-node", "host-bat"])
    });

    it("Should make vertex", () => {
        expect(makeVertexFromNode(getNode(tree, "A"), false).textLabel).toEqual({
            labelBelow: false,
            x: "12",
            y: "0",
            alignmentBaseline: "middle",
            textAnchor: "start",
        })
    });

    it("Should make rectangular vertex", () => {
        expect(rectangularLayout(tree).vertices[0]).toEqual({
            "classes": ["external-node", "host-bat"],
            "id": "A",
            "textLabel": {"alignmentBaseline": "middle", "labelBelow": 0, "textAnchor": "start", "x": "12", "y": "0"},
            "x": 7.1,
            "y": 0
        })
    });


    it("Should make an edge", () => {
        const expected = [{x:0,y:0.5},{x:0,y:2},{x:5,y:0},{x:5,y:1}]

        expect(rectangularLayout(tree).edges.map(e=>({x:e.x,y:e.y}))).toEqual(expected)

    })
})