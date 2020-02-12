import {ImmutableTree} from "../src/utils/immutableTree";
import {getVertexClassesFromNode, makeVertexFromNode} from "../src/utils/layouts/layoutHelpers";

const treeData = ImmutableTree.parseNewick("((A[&rate=1,host=\"bat\"]:2.1,B[&rate=1.1]:3)[&rate=1.5]:5,C[&rate=4]:1);");
const tree = new ImmutableTree(treeData);
describe("Testing layout helper functions",()=>{
    it("Should get classes",()=>{

        expect(getVertexClassesFromNode("A",tree)).toEqual(["external-node","host-bat"])
    })
    it("Should make vertex",()=>{
        expect(makeVertexFromNode("A",tree).textLabel).toEqual({
            labelBelow:false,
                x:"12",
                y:"0",
                alignmentBaseline: "middle",
                textAnchor:"start",
        })
    })
    it("Should make an edge",()=>{
        const vertices = [{id:"A",x:2,y:3,classes:["tester-class"]},{id:"node1",x:1,y:2}]

    })
})