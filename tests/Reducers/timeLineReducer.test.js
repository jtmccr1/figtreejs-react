import timelineReducer from "../../src/Context/reducers/timelineReducer";
import {scaleTime} from "d3-scale";
import {timeParse} from "d3-time-format";
const timeConverter =timeParse("%Y-%m-%d");
describe("Timeline reducer test",()=>{
    const timeScale= scaleTime().domain([new Date(8640000000000000),new Date(-8640000000000000)]).range([0,100]);
    test("new extent",()=>{
        const newScale =timelineReducer(timeScale,{type:"new extent",payload:{minTime:timeConverter("2013-05-25"),maxTime:timeConverter("2015-02-17")}});

        expect(newScale.domain()).toEqual([timeConverter("2013-05-25"),timeConverter("2015-02-17")]);
    });
    test("new min",()=>{
        const newScale =timelineReducer(timeScale,{type:"new min",payload:{minTime:timeConverter("2013-05-25"),maxTime:timeConverter("2015-02-17")}});
        expect(newScale.domain()).toEqual([timeConverter("2013-05-25"),new Date(-8640000000000000)]);
    });
    test("new max",()=>{
        const newScale =timelineReducer(timeScale,{type:"new max",payload:{minTime:timeConverter("2013-05-25"),maxTime:timeConverter("2015-02-17")}});
        expect(newScale.domain()).toEqual([new Date(8640000000000000),timeConverter("2015-02-17")]);
    });
});