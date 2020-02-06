Axis example:

```jsx
import {scaleLinear} from "d3-scale";
const x = scaleLinear().domain([0,10]).range([0,200]);
const y= scaleLinear().domain([10,0]).range([0,200]);
<svg width={300} height={300}>
       <Axis transform={`translate(80,200)`} scale={x} numTicks = {10} direction={"horizontal"} title={{text:"title",padding:40}} tick={{padding:20}}/>
       <Axis transform={`translate(80,0)`} scale={y} numTicks = {10} direction={"vertical"} title={{text:"title",padding:-40}} tick={{padding:-20}}/>
</svg>
```
