```jsx
import Axis from "./Axis"
import {scaleLinear} from "d3-scale";
import {format} from "d3-format";
const x = scaleLinear().domain([0,10]).range([0,200]);
const y= scaleLinear().domain([10,0]).range([0,200]);
<svg width={400} height={400}>
<g transform="translate(70,50)">
           <Axis  direction={"horizontal"} title={{text:"title",padding:40}} ticks= {{number:5,format:format(".1f"),padding:20,style:{},length:6}}>
                <AxisBars />
            </Axis>
         <Axis  direction={"vertical"} title={{text:"title",padding:-40}} ticks= {{number:5,format:format(".1f"),padding:-25,style:{},length:6}}/>
</g>
</svg>
```