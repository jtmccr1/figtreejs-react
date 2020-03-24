import React from "react";
let counter =1;
export default function withClipPath(WrappedContainer){
   function ClippedPath(props){
       const {clipPath,clipTransform,...restProps}=props;
       const id=`clipPath${(counter+=1)}`;
       clipPathMap.set(props.edge.v0.id,id);
       return(
           <>
               <defs>
                   <clipPath id={id}>
                           <path d={clipPath}/>
                   </clipPath>
               </defs>
               <g clipPath={`url(#${id})`}>
                   <WrappedContainer {...restProps}/>
               </g>
           </>
       )
   }

   return React.memo(ClippedPath);

}