import React, {useContext,useCallback} from "react"
// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import {DataType} from "../../../utils/utilities";
import {useInteractions, useInteractionsDispatch} from "../../../hooks";


/**
 * ContinuousLegend
 *
 * A color legend that accept continuous and sequential color scales. It is modeled after the color legends
 * at https://observablehq.com/@d3/color-legend
 *
 * @param props
 * @param scale
 * @param pos
 * @param width
 * @param height
 * @param title
 * @return {(number|*)[]|*}
 * @constructor
 */

export default function DiscreteLegend({scale,pos,width,height,swatchSize,format,annotation,columns,onClick} ){
//TODO hard coded location on hover call back.
    const dispatch = useInteractionsDispatch();
    const onHover=useCallback((value)=>()=>dispatch({type:"hover",payload:{dataType:DataType.DISCRETE,key:annotation,value:value}}))
    const onUnHover = useCallback(()=>dispatch({type:"unhover",payload:{}}));
    return(
        <foreignObject x={pos.x} y={pos.y} width={width} height={height}>
            <div css={css`display: flex; align-items: center; min-height: 33px; font: 12px sans-serif;`}>
                <div css={css`width: 100%; columns: ${columns};"`}>
                    {scale.domain().sort().map(value => {
                        return(
                            <div key={value}  css={css`cursor:pointer;
                                                      break-inside: avoid;
                                                      display: flex;
                                                      align-items: center;
                                                      padding-bottom: 1px;
                                                        `} onMouseEnter={onHover(value)}
                                                            onMouseLeave={()=>onUnHover()}
                                                            onClick={()=>onClick(value)} >
                                <div css={css`width: ${swatchSize}px;
                                  height: ${swatchSize}px;
                                  margin: 0 0.5em 0 0;
                                  background:${scale(value)}
                                  `}/>
                                  <div css={css`
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                max-width: calc(100% - ${swatchSize}px - 0.5em);`}
                                  >{format(value)}</div>
                            </div>)
                    }
                    )}
                </div>
            </div>
        </foreignObject>
    )

}



DiscreteLegend.defaultProps={
    pos:{x:50,y:0},
    width:100,
    height:100,
    swatchSize:10,
    format:x=>x,
    title:"",
    columns:2,
    onClick:()=>true
}
