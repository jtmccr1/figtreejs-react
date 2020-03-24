A Figtree component is a specific type of plot that takes a tree and layout and passes the vertices and edges to node and branch children
The node and branch children are themselves special extensions of elements and can take all the usual props elements can.
```jsx harmony
import {FigTree,Nodes,Branches,parseNewick,rectangularVertices} from "../../index.js";	
const margins={top:10,bottom:10,left:10,right:10};
const newickString =	
    '((((((virus1:0.1,virus2:0.12)0.95:0.08,(virus3:0.011,virus4:0.0087)1.0:0.15)0.65:0.03,virus5:0.21)1.0:0.2,(virus6:0.45,virus7:0.4)0.51:0.02)1.0:0.1,virus8:0.4)1.0:0.1,(virus9:0.04,virus10:0.03)1.0:0.6);';
const tree = parseNewick(newickString,{labelName:"support"});	

<svg width={600} height={400}>
    <FigTree   width={600-margins.left-margins.right} height={400-margins.bottom-margins.top} data={tree} layout={rectangularVertices} pos={{x:margins.left,y:margins.top}}>
            <Nodes.Circle attrs={{r:2,fill:"black"}} hoveredAttrs={{r:10,fill:'#ae7e56',strokeWidth:2}} selectedAttrs={{fill:"#c0625e"}}/>
            <Nodes.Coalescent filter={(v=>v.node.children)}/>
        <Branches.Rectangular attrs={{strokeWidth:4,stroke:"black"}} />
    </FigTree>
</svg>
```
