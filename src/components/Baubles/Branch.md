Branch example:

```jsx
import BranchPath from "./BranchPath";

import {scaleLinear} from "d3-scale";

const scales = {x: scaleLinear().domain([0,200]).range([0,200]),
               y:scaleLinear().domain([0,200]).range([0,200])}

const edge={x:100,y:100,classes:["internal-node","tester"],v0:{x:10,y:10},v1:{x:100,y:40}};

<svg width={200} height={200}>
        <Branch scales={scales} edge = {edge}>
                <BranchPath scales={scales} edge={edge}/>
        </Branch>
</svg>
```
