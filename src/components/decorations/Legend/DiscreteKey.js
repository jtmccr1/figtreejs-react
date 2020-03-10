import React from "react"
import ColorRamp from "./ColorRamp";
import Axis from "../Axis/Axis";
import {format} from "d3-format";
import {quantize, interpolate, interpolateRound} from "d3-interpolate";
// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/core'


/**
 * Legend
 *
 * A color legend that accept continuous and sequential color scales. It is modeled after the color legends
 * at https://observablehq.com/@d3/color-legend
 *
 * @param props
 * @param scale
 * @param pos
 * @param width
 * @param height
 * @param direction
 * @param title
 * @param ticks
 * @param tickFormat
 * @return {(number|*)[]|*}
 * @constructor
 */

export default function DiscreteLegend({scale,pos,width,height,swatchSize,format,title,columns} ){
    return(
        <foreignObject x={pos.x} y={pos.y} width={width} height={height}>
            <div css={css`display: flex; align-items: center; min-height: 33px; font: 12px sans-serif;`}>
                <div css={css`width: 100%; columns: ${columns};"`}>
                    {scale.domain().map(value => {
                        return(
                            <div key={value} css={css`break-inside: avoid;
                                                      display: flex;
                                                      align-items: center;
                                                      padding-bottom: 1px;
                                                        `}>
                                <div css={css`width: ${swatchSize}px;
                                  height: ${swatchSize}px;
                                  margin: 0 0.5em 0 0;
                                  background:${scale(value)}`}/>
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
}
