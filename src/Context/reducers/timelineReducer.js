export default function timelineReducer(timeScale,action){
    const [minTime,maxTime] = timeScale.domain();
    switch(action.type){
        case "new max":
            return timeScale.copy().domain([minTime,action.payload.maxTime]);
        case"new min":
            return timeScale.copy().domain([action.payload.minTime,maxTime]);
        case "new extent":
            return timeScale.copy().domain([action.payload.minTime,action.payload.maxTime]);
    }
}