```jsx harmony
import {range} from "d3-array";
const data =range(100).map(d=>Math.random()*100);
<svg width={200} height={200}>
    <g transform={"tanslate(10,150"}>
        <KDE data={data} numbThresholds={10} height={125} width={175}/>
    </g>
</svg>
```