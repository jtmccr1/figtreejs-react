Continuous legend example:

```jsx
import Legend from "./index"
import {scaleSequential,scaleQuantile} from "d3-scale";
import {interpolateViridis} from "d3-scale-chromatic";
const scale = scaleSequential([0,100],interpolateViridis);
<svg width={2500} height={200}>
           <Legend.Continuous scale={scale}/>
</svg>
```


```jsx
import Legend from "./index"
import {scaleSequential,scaleSequentialQuantile} from "d3-scale";
import {interpolateViridis} from "d3-scale-chromatic";
const scale = scaleSequentialQuantile([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,3,3,3,3,10],interpolateViridis);

<svg width={500} height={200}>
           <Legend.Continuous scale={scale}/>
</svg>
```