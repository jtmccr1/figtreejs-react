import {getVertexClassesFromNode, makeVertexFromNode} from "../src/utils/layouts/layoutHelpers";
import {edgeFactory, makeEdge, rectangularVertex} from "../src/utils/layouts/"
import {mean} from "d3-array";
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
        expect(rectangularLayout(tree)[2]).toEqual({
            "classes": ["internal-node", "host-undefined"],
            "id": "node1",
            "textLabel": {"alignmentBaseline": "hanging", "labelBelow": 0, "textAnchor": "end", "x": "-6", "y": "8"},
            "x": 5,
            "y": 0.5
        })
    });


    it("Should make an edge", () => {
        const vertices = rectangularLayout(getNode(tree, "node1"));
        const source = vertices.slice(-1)[0];
        const target = vertices[0];

        expect(edgeFactory(rectangularLayout)(getNode(tree, "node1"))[1]).toEqual({
            v0: source,
            v1: target,
            id: "A",
            classes: target.classes,
            x: source.x,
            y: target.y,
            textLabel: {
                x: mean([target.x, source.x]),
                y: -6,
                alignmentBaseline: "bottom",
                textAnchor: "middle",
            }
        })

    })
})