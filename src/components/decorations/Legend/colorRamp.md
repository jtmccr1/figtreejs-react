color ramp example:

```jsx
import {scaleSequential,scaleSequentialQuantile} from "d3-scale";
import {interpolateViridis} from "d3-scale-chromatic";
import {quantize,interpolate} from "d3-interpolate";
const scale = scaleSequential([0,100],interpolateViridis);
<svg width={200} height={70}>
       <ColorRamp ramper={scale.interpolator()}/>
</svg>
```