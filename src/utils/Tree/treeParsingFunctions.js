import {Type} from "./immutableTree";
import {extent} from "d3-array";
import {decimalToDate} from "../utilities";
import {timeParse} from "d3-time-format";

export function parseAnnotation(annotationString){
    const setRegex = /\{(.+)\}/;
    // const setRegex = /\{(.+)\}/;
    const out = {};
    for( const annotation of splitAtExposedCommas(annotationString)){

        let [annotationKey,data] = annotation.split("=");
        //TODO ensure this is working
        annotationKey=annotationKey.replace(/\./g,"_");
        if(setRegex.test(data)) {
            data = data.split(setRegex).filter(s => s !== "").reduce((acc,curr)=>acc.concat(splitAtExposedCommas(curr)),[]);
            if (data.reduce((acc, curr) => (acc & !isNaN(curr)), true)) {
                data = data.map(d => parseFloat(d));
            }else{
                data = data.reduce((acc,curr)=>acc.concat(curr.split(/[(?:\")')]/).filter(s=>s!=="")),[])
            }
            out[annotationKey]=data;
        }else{
            data = data.split(/[(?:\")')]/).filter(s=>s!=="")[0] ;
            if(isNaN(data)){
                out[annotationKey]=data
            }else{
                out[annotationKey]=parseFloat(data);
            }
        }
    }
    return constructProbabilitySet(out)
}

export function constructProbabilitySet(out){
    const keys =Object.keys(out);
    const finalObject ={};
    const skippedKeys = [];
    for(const probabilityKey of keys){

        if(/.+_set_prob/.test(probabilityKey)){
            const base = probabilityKey.split("_set_prob").filter(s=>s!=="")[0];
            const traitkey = `${base}_set`;
            const probabilities=[].concat(out[probabilityKey]);
            skippedKeys.push(traitkey);
            if(keys.includes(traitkey)) {
                const probabilitySet = {};
                for (let i = 0; i < out[traitkey].length; i++) {
                    probabilitySet[out[traitkey][i]] = probabilities[i];
                }
                finalObject[`${base}_probSet`] = {...probabilitySet};
            }
        }else if(!(skippedKeys.includes(probabilityKey)))
            finalObject[probabilityKey]=out[probabilityKey];
    }
    return finalObject;
}
export function reconcileAnnotations(incomingAnnotations,currentAnnotations={}){
    for (let [key, types] of Object.entries(incomingAnnotations)) {
        let annotation = currentAnnotations[key];
        if (!annotation) {
            currentAnnotations[key] = {...types};
        } else {
            const type = types.type;
            if (annotation.type !== type) {
                if ((type === Type.INTEGER && annotation.type === Type.FLOAT) ||
                    (type === Type.FLOAT && annotation.type === Type.INTEGER)) {
                    // upgrade to float
                    annotation.type = Type.FLOAT;
                    if (annotation.values) {
                        delete annotation.values;
                    }
                    annotation.extent = annotation.extent ? extent(annotation.extent.concat(types.extent)) : [...types.extent]
                } else {
                    throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
                }
            } else if (annotation.type === type) {
                if (type === Type.DISCRETE) {
                    if (!annotation.values) {
                        annotation.values = new Set();
                    }
                    annotation.values = new Set([...annotation.values, ...types.values])
                } else if (annotation.values || types.values) {
                    annotation.values = annotation.values ? annotation.values.concat(types.values) : [...types.values]
                } else if (annotation.extent || types.extent) {
                    annotation.extent = annotation.extent ? extent(annotation.extent.concat(types.extent)) : [...types.extent]
                }
            }
        }
    }
    return currentAnnotations;
}

export function typeAnnotations(annotations){
    let annotationTypes={};
    for (let [key, addValues] of Object.entries(annotations)) {
        const annotation = {};
        annotationTypes[key] = annotation;
        if(addValues instanceof Date){
            annotation.type=Type.DATE;
            annotation.extent = [addValues,addValues];
        } else if (Array.isArray(addValues)) {
            // is a set of  values
            let type;
            if(addValues.map(v=>isNaN(v)).reduce((acc,curr)=>acc&&curr,true)) {
                type = Type.DISCRETE;
                annotation.type = type;
                if (!annotation.values) {
                    annotation.values = new Set();
                }
                annotation.values.add(...addValues);
            }else if(addValues.map(v=>parseFloat(v)).reduce((acc,curr)=>acc&&Number.isInteger(curr),true)){
                type =Type.INTEGER;
                annotation.extent=extent(addValues)
            }else{
                type = Type.FLOAT;
                annotation.extent=extent(addValues)
            }

            if (annotation.type && annotation.type !== type) {
                if ((type === Type.INTEGER && annotation.type === Type.FLOAT) ||
                    (type === Type.FLOAT && annotation.type === Type.INTEGER)) {
                    // upgrade to float
                    type = Type.FLOAT;
                    annotation.type = Type.FLOAT;
                    if(annotation.values){
                        delete annotation.values;
                    }else{
                        throw Error(`existing values of the annotation, ${key}, in the tree is discrete.`);
                    }
                }
            }
            annotation.type=type;
            // annotation.values = annotation.values? [...annotation.values, ...addValues]:[...addValues]
        } else if (Object.isExtensible(addValues)) {

            // is a set of properties with values
            let type = undefined;
            let sum = 0.0;
            let keys = [];
            for (let [key, value] of Object.entries(addValues)) {
                if (keys.includes(key)) {
                    throw Error(`the states of annotation, ${key}, should be unique`);
                }
                if (typeof value === typeof 1.0) {
                    // This is a vector of probabilities of different states
                    type = (type === undefined) ? Type.PROBABILITIES : type;

                    if (type === Type.DISCRETE) {
                        throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                    }

                    sum += value;
                    if (sum > 1.01) {
                        throw Error(`the values of annotation, ${key}, should be probabilities of states and add to 1.0`);
                    }
                } else if (typeof value === typeof true) {
                    type = (type === undefined) ? Type.DISCRETE : type;

                    if (type === Type.PROBABILITIES) {
                        console.warn(annotations)
                        throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                    }
                } else {
                    throw Error(`the values of annotation, ${key}, should be all boolean or all floats`);
                }
                keys.push(key);
            }
            if (annotation.type && annotation.type !== type) {
                throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
            }
            annotation.type = type;
            annotation.values = annotation.values? [...annotation.values, addValues]:[addValues]
        } else {
            let type = Type.DISCRETE;

            if (typeof addValues === typeof true) {
                type = Type.BOOLEAN;
            } else if (!isNaN(addValues)) {
                type = (addValues % 1 === 0 ? Type.INTEGER : Type.FLOAT);
            }

            if (annotation.type && annotation.type !== type) {
                if ((type === Type.INTEGER && annotation.type === Type.FLOAT) ||
                    (type === Type.FLOAT && annotation.type === Type.INTEGER)) {
                    // upgrade to float
                    type = Type.FLOAT;
                } else {
                    throw Error(`existing values of the annotation, ${key}, in the tree is not of the same type`);
                }
            }

            if (type === Type.DISCRETE) {
                if (!annotation.values) {
                    annotation.values = new Set();
                }
                annotation.values.add(addValues);
            }else if( type===Type.FLOAT|| type===Type.INTEGER){
                annotation.extent=[addValues,addValues]
            }

            annotation.type = type;
        }

        // overwrite the existing annotation property
        // annotationTypes[key] = annotation;
    }
    return annotationTypes;
}

export function stripQuotes(string){
    // remove any quoting and then trim whitespace
    return removeEndQuotes(removeFrontQuotes(string))
}
export function removeFrontQuotes(s){
    if (s.startsWith("\"") || s.startsWith("\'")) {
        return s.slice(1);
    }
    return s;
}

export function removeEndQuotes(s){
    if (s.endsWith("\"") || s.endsWith("\'")) {
        return s.slice(0, s.length - 1);
    }
    return s;
}
export function verifyNewickString(s){
    if(s[s.length-1]!==";"){
        throw new Error("Unknown format. Newick strings should end in ;")
    }
    if(((s.match(/\(/g) || []).length)!==((s.match(/\)/g) || []).length)){
        throw new Error("Unmatched parenthesis in newick string")
    }
}

export function getDate(name,datePrefix,dateFormat){
    const parts = name.split(datePrefix);
    if (parts.length === 0) {
        throw new Error(`the tip, ${name}, doesn't have a date separated by the prefix, '${datePrefix}'`);
    }
    const dateBit = parts[parts.length-1];
    if(dateFormat==="decimal"){
        const decimalDate = parseFloat(parts[parts.length - 1]);
        return decimalToDate(decimalDate);
    }else{
        let date = timeParse(dateFormat)(dateBit);
        if(!date){
            date = timeParse(dateFormat)(`${dateBit}-15`)
        }
        if(!date){
            date = timeParse(dateFormat)(`${dateBit}-06-15`)
        }
        return date
    }
}
//TODO speed up - it's slow to do this everytime essentially nested looping
export function splitAtExposedCommas(string){
    const open=["(","[","{"];
    const close=[")","]","}"];
    let count=0;
    const commas=[-1];

    const stringLength= string.length;
    for(let i=0;i<stringLength;i++){
        if(open.includes(string[i])){
            count+=1;
        }else if(close.includes(string[i])){
            count-=1;
        }else if(count===0 &&string[i]===","){
            commas.push(i)
        }
    }
    commas.push(string.length);

    const splits = [];
    const commaLength = commas.length;
    for(let i=1;i<commaLength;i++){
        splits.push(string.slice(commas[i-1]+1,commas[i]))
    }
    return splits;

}
