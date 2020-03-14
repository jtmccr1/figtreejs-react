import React,{useMemo,useContext} from "react"
import Branch from "./Branch";
import RectangularBranchPath, {CoalescentBranch} from "./Shapes/RectangularBranchPath";
import {mapAttrsToProps} from "../../../../utils/baubleHelpers";
import {ScaleContext} from "../../FigTree.js";
import {LayoutContext} from "../../FigTree";

function BranchesHOC(PathComponent) {
    return function Branches(props){
        const {scales} = useContext(ScaleContext);
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
                return (
                    <Branch key={`branch-${e.id}`} id={`branch-${e.id}`} classes={e.classes} x={scales.x(e.x)} y={scales.y(e.y)}>
                        <PathComponent {...getPosition(e)}
                                       attrs={attrMapper(e)}
                                       edge={e}/>
                    </Branch>
                )
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
const Branches={Rectangular:RectangularBranches,Coalescent:CoalescentBranches};
export default Branches;