import {ImmutableTree} from "../src/utils/immutableTree";
import {getVertexClassesFromNode, makeVertexFromNode} from "../src/utils/layouts/layoutHelpers";
import {makeEdge, rectangularVertex} from "../src/utils/layouts/"
import {mean} from "d3-array";
const treeData = ImmutableTree.parseNewick("((A[&rate=1,host=\"bat\"]:2.1,B[&rate=1.1]:3)[&rate=1.5]:5,C[&rate=4]:1);");
const tree = new ImmutableTree(treeData);
describe("Testing layout helper functions",()=>{
    it("Should get classes",()=>{

        expect(getVertexClassesFromNode("A",tree)).toEqual(["external-node","host-bat"])
    });
    it("Should make vertex",()=>{
        expect(makeVertexFromNode("A",tree).textLabel).toEqual({
            labelBelow:false,
                x:"12",
                y:"0",
                alignmentBaseline: "middle",
                textAnchor:"start",
        })
    });
    it("Should make rectangular vertex",()=>{
        expect(rectangularVertex("node1",tree)).toEqual({
            id:"node1",
            x:5,
            y:0.5,
            classes:["internal-node"],
            textLabel: {
                labelBelow:false,
                x:"-6",
                y:"8",
                alignmentBaseline:"hanging",
                textAnchor:"end"
            }
            })
    })
    it("Should make an edge",()=>{
        const vertex = rectangularVertex("A",tree);
        const parent = rectangularVertex("node1",tree);

        expect(makeEdge(rectangularVertex)("A",tree)).toEqual({
            v0: parent,
            v1: vertex,
            id: "A",
            classes: vertex.classes,
            x: parent.x,
            y: vertex.y,
            textLabel: {
                x: mean([vertex.x, parent.x]),
                y: -6,
                alignmentBaseline: "bottom",
                textAnchor: "middle",
            }
        })


    });
})