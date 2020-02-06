Group example:

```jsx
import SVG from "./SVG";
import G from "./G";
<SVG width={200} height={200}>
	<G transform={"translate(100,100)"}>
		<Path  d={"M 10 10 C 20 20, 40 20, 50 10"} strokeWidth={2} stroke={"steelblue"} fill={"none"}/>
	</G>
</SVG>
```
