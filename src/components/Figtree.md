FigTree example:

```jsx
import {Tree} from "../utils/tree";
import {rectangularLayout} from "../utils/layouts/rectangularLayout.f.js";
import Branch from "./Baubles/Branch";
import BranchPath from "./Baubles/BranchPath";

const newickString =
        '((((((virus1:0.1,virus2:0.12)0.95:0.08,(virus3:0.011,virus4:0.0087)1.0:0.15)0.65:0.03,virus5:0.21)1.0:0.2,(virus6:0.45,virus7:0.4)0.51:0.02)1.0:0.1,virus8:0.4)1.0:0.1,(virus9:0.04,virus10:0.03)1.0:0.6);';

 const tree = Tree.parseNewick(newickString);
 const margins = {top:10,right:10,bottom:10,left:10};
 const size = {width:200,height:200};

<svg {...size}>
    <FigTree size={size} tree={tree} margins={margins} layout={rectangularLayout} />
</svg>
```