import React,{useMemo,useContext} from "react"
import Branch from "./Branch";
import RectangularBranchPath from "./Shapes/RectangularBranchPath";
import CoalescentBranch from "./Shapes/CoalescentBranchPath";
import {mapAttrsToProps} from "../../../../utils/baubleHelpers";
import {LayoutContext} from "../../FigTree";
import {useScales} from "../../../../hooks";

function BranchesHOC(PathComponent) {
    return function Branches(props){
        const {scales} = useScales();
        const {edges} = useContext(LayoutContext);
        const {attrs, filter} = props;
        const attrMapper = useMemo(() => mapAttrsToProps(attrs), [attrs]);
        function getPosition(e){
            return {
                x0: scales.x(e.v0.x),
                y0: scales.y(e.v0.y),
                x1: scales.x(e.v1.x),
                y1: scales.y(e.v1.y)
            }
        };

        return (<>
            {edges.filter(filter).map(e => {
                return (<PathComponent  key={`branch-${e.id}`} {...getPosition(e)}
                                       attrs={attrMapper(e)}
                                       edge={e}/>)
            })
            }
        </>)
    }
}

const RectangularBranches=BranchesHOC(RectangularBranchPath);
RectangularBranches.defaultProps={
    filter:e=>true
};
const CoalescentBranches = BranchesHOC(CoalescentBranch);

const Branches={Rectangular:RectangularBranches,
    Coalescent:CoalescentBranches};
export default Branches;