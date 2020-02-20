Axis example:

```jsx
import {scaleLinear} from "d3-scale";
import {format} from "d3-format";
const x = scaleLinear().domain([0,10]).range([0,200]);
const y= scaleLinear().domain([10,0]).range([0,200]);
<svg width={300} height={300}>
       <Axis transform={`translate(80,200)`} scale={x} direction={"horizontal"} title={{text:"title",padding:40}} ticks= {{number:5,format:format(".1f"),padding:20,style:{},length:6}}/>
       <Axis transform={`translate(80,0)`} scale={y}  direction={"vertical"} title={{text:"title",padding:-40}} ticks= {{number:5,format:format(".1f"),padding:-20,style:{},length:6}}/>
</svg>
```