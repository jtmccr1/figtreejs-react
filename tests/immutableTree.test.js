import ImmutableTree from "../src/utils/immutableTree";

describe("Tree Tests",()=>{
    it("parse newick",()=>{
        const treeString="((A:1,B:2):3,C:4,D:4):120;"
        const tree = ImmutableTree.parseNewick(treeString);
    })
})