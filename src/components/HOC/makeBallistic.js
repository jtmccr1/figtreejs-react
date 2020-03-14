import React, {useCallback, useState} from "react";

import BallisticMissal from "../Map/BallisticMissal";
export default function makeBallistic(WrappedPath){
    return function(props){
        const [node,setNode] = useState(null);

        const{missileProps,pathProps} = props;

        const measuredPath= useCallback(node => {
            if (node !== null) {
                setNode(node);
            }
        }, []);

        return<>
            <WrappedPath {...pathProps} ref={measuredPath}/>
            {node &&
            <BallisticMissal {...missileProps} node={node}/>
            }
        </>
    }
}
