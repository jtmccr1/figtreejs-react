```jsx
import Axis from "./Axis"
import {scaleLinear} from "d3-scale";
import {format} from "d3-format";
const x = scaleLinear().domain([0,10]).range([0,200]);
const y= scaleLinear().domain([10,0]).range([0,200]);
<svg width={300} height={300}>
       <Axis  height={300} width={300} margins={{top:0,right:20,bottom:100,left:80}} transform={`translate(80,200)`} scale={x} numTicks = {10} direction={"horizontal"} title={{text:"title",padding:40}} tick= {{number:5,format:format(".1f"),padding:20,style:{},length:6}}>
        <AxisBars />
        </Axis>
       <Axis transform={`translate(80,0)`} scale={y} numTicks = {10} direction={"vertical"} title={{text:"title",padding:-40}} tick= {{number:5,format:format(".1f"),padding:-20,style:{},length:6}}/>
</svg>
```