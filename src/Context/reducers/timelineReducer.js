export default function timelineReducer(timeScale,action){
    const [minDate,maxDate] = timeScale.domain();

    let newScale;
    switch(action.type){
        case "new max":
            newScale= timeScale.copy().domain([minDate,action.payload.maxDate]);
            break;
        case"new min":
            newScale= timeScale.copy().domain([action.payload.minDate,maxDate]);
            break;
        case "new extent":
            newScale= timeScale.copy().domain([action.payload.minDate,action.payload.maxDate]);
            break;
        default:
             newScale=timeScale;
    }
    return newScale
}