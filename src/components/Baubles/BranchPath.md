Branch example:

```jsx
import {scaleLinear} from "d3-scale";

const scales = {x: scaleLinear().domain([0,200]).range([0,200]),
               y:scaleLinear().domain([0,200]).range([0,200])}

const edge={x:50,y:50,classes:["internal-node","tester"],v0:{x:10,y:10},v1:{x:100,y:40}};

<svg width={200} height={200}>
	<g transform={"translate(100,100)"}>
        <BranchPath scales={scales} edge={edge}/>
	</g>
</svg>
```
