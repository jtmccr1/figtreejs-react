import ImmutableTree from "../src/utils/immutableTree";

describe("Tree Tests",()=>{
    it("parse newick",()=>{
        const treeString="((A:1,B:2):3,C:4,D242[&length_range={2.9997859591901488E-6,0.15966713321452264},location=\"Mabalako\",location.prob=1.0,location.set={\"Mabalako\"},8630136985685]:4)[&a={1}]):120;"
        const tree = ImmutableTree.parseNewick(treeString);

        console.log(tree);
    })
});