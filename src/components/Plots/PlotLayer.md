A plot layer is a group of objects that share a data source and scales.
It takes data, layout,width, height and position of a group on an svg
and creates the scales and layout-ed out data needed for a visualization.
It provides laid out data, scales, and default interactions as context for it's children.
The children should be elements. Note that multiple layers can be added to an svg.
The layout function should return an array of data each entry should have an x,y, and classes entries
if not they will default to 0,0 and []


There needs to be defaults added so positioning is not so janky. maybe move some of the path stuff to a path 
specific component.
```jsx harmony
import {PlotLayer,Element} from "../../index";
import {range,extent} from "d3-array";
import {line} from "d3-shape";
import {scaleLinear} from "d3-scale"
const data = range(0,10).map(n=>({id:n,x:Math.random(),y:Math.random(),classes:[],annotations:{}}));

const margins={top:10,bottom:10,left:10,right:10},width=400,height=400;
const scales={x:scaleLinear().domain(extent(data,d=>d.x)).range([0,width-margins.left-margins.right]),
y:scaleLinear().domain(extent(data,d=>d.y)).range([0,height-margins.top-margins.bottom])};

const path =(data,scales) => {
    const lineMaker = line().x(d=>scales.x(d.x)).y(d=>scales.y(d.y));
    return lineMaker(data.points);
};
const pathLayout = (data)=>([{x:scales.x.domain()[0],y:scales.y.domain()[0],annotations:{},id:"0",points:data}]);
const lineData = pathLayout(data);

<svg width={width} height={height}>
    <PlotLayer data={data}  width={width-margins.left-margins.right} height={height-margins.bottom-margins.top}  pos={{x:margins.left,y:margins.top}}>
        <Element.circle filter={()=>true} attrs={{r:6,fill:"black"}} hoveredAttrs={{r:10,fill:'#ae7e56',strokeWidth:2}}/>
    </PlotLayer>
        <PlotLayer data={lineData} scales={scales} width={width-margins.left-margins.right} height={height-margins.bottom-margins.top}  pos={{x:margins.left,y:margins.top}}>
            <Element.path filter={()=>true} attrs={{d:path,fill:"none",stroke:"black",strokeWidth:1}} hoveredAttrs={{stroke:"grey",strokeWidth:2}}/>
        </PlotLayer>
</svg>
```


