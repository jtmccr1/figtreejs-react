import React, { useContext } from "react"

/**
 * This is map component it set the height width ect. of the map and takes shared parameters like the
 * the projection
 * @param width
 * @param height
 * @param margins
 * @param projection
 * @constructor
 */
export const ProjectionContext =React.createContext(1);
export default function Map({width,height,scale,margins,projection,...props}){
   return(
       <ProjectionContext.Provider value={projection}>
        {props.children}
    </ProjectionContext.Provider>
   )
}