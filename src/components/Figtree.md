FigTree example:

```jsx harmony
import {FigTree,Nodes,Branches} from "../index.js";	
import {parseNewick,orderByNodeDensity} from "../utils/Tree/treeOperations"
import {getNode} from "../utils/Tree/treeSettersandGetters" ; 
import {NodeShape,CoalescentNode} from "../index";


const newickString =	
    '((((((virus1:0.1,virus2:0.12)0.95:0.08,(virus3:0.011,virus4:0.0087)1.0:0.15)0.65:0.03,virus5:0.21)1.0:0.2,(virus6:0.45,virus7:0.4)0.51:0.02)1.0:0.1,virus8:0.4)1.0:0.1,(virus9:0.04,virus10:0.03)1.0:0.6);';

const tree = parseNewick(newickString,{labelName:"support"});	
<svg width={600} height={400}>
    <FigTree  margins={{top:10,bottom:10,left:10,right:10}} width={600} height={400} tree={tree} >
        <Nodes filter={v=>!v.node.children}>
            <NodeShape hoveredAttrs={{r:10,fill:'#ae7e56',strokeWidth:2}} selectedAttrs={{fill:"#c0625e"}}/>
        </Nodes>
        <Nodes filter={v=>v.node.children}>
            <CoalescentNode/>
        </Nodes>
        < Branches/>
    </FigTree>
</svg>
```

 