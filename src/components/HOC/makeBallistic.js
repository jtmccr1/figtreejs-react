import React, {useCallback, useState} from "react";

import BallisticMissal from "../Map/BallisticMissal";
export default function makeBallistic(WrappedPath){
    return function(props){
        const [node,setNode] = useState(null);

        const{relativeLength,maxWidth,progress,...pathProps} = props;

        const measuredPath= useCallback(node => {
            if (node !== null) {
                setNode(node);
            }
        }, []);

        return<>
            <WrappedPath {...pathProps} ref={measuredPath}/>
            {node &&
            <BallisticMissal relativeLength={relativeLength} maxWidth={maxWidth} progress={progress} node={node}/>
            }
        </>
    }
}
