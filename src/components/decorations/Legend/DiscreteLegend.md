Discrete legend example:

```jsx
import {scaleOrdinal} from "d3-scale";
import {schemeTableau10} from "d3-scale-chromatic";
import Legend from "./index"
const colorScale = scaleOrdinal().domain(["cat","dog","bird"]).range(schemeTableau10);
<svg width={2500} height={70}>
           <Legend.Discrete scale={colorScale}/>
</svg>
```