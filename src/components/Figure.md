Figure example


```jsx harmony

import {FigTree,Nodes, NodeShape,Branch,Node,Branches,BranchPath,ImmutableTree,rectangularVertex,makeEdge} from "../index.js";	

const newickString =	
    '((((((virus1:0.1,virus2:0.12)0.95:0.08,(virus3:0.011,virus4:0.0087)1.0:0.15)0.65:0.03,virus5:0.21)1.0:0.2,(virus6:0.45,virus7:0.4)0.51:0.02)1.0:0.1,virus8:0.4)1.0:0.1,(virus9:0.04,virus10:0.03)1.0:0.6);';

const treeData = ImmutableTree.parseNewick(newickString,{labelName:"support"});	
const tree = new ImmutableTree(treeData);	
     const vertices = tree.getPostOder().map(id=>rectangularVertex(id,tree));	
     const edges =   tree.getPostOder().filter(id=>id!==tree.getRoot()).map(id=>makeEdge(rectangularVertex)(id,tree));	



     <Figure margins={{top:10,bottom:10,left:10,right:10}} width={600} height={400} >
         <Branches edges ={edges} curvature={0} label={e=>e.label} onHover={()=>true} onClick={()=>true} attrs={{strokeWidth:5}}/>
     </Figure>
```