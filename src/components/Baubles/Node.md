Node example:

```jsx
import SVG from "../svgElements/SVG";
import Circle from "../svgElements/Circle";
import {scaleLinear} from "d3-scale";

const scales = {x: scaleLinear().domain([0,200]).range([0,200]),
               y:scaleLinear().domain([0,200]).range([0,200])}

const vertex ={x:10,y:10,classes:["internal-node"]};

<SVG width={200} height={200}>
        <Node scales={scales} vertex = {vertex} children={[Circle]} r={"10"} fill={"steelblue"}/>
</SVG>
```
