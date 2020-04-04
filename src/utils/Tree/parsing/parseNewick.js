/**
 * This parsing function was inspired by the newick importer in BEAST
 */


import {
    getDate,
    parseAnnotation,
    readUntilFactory,
    reconcileAnnotations, stripQuotes,
    typeAnnotations,
    verifyNewickString
} from "./treeParsingFunctions";

export function parseNewick(newickString, options = {}) {
    options = {...{labelName: "label", datePrefix: undefined, dateFormat: "%Y-%m-%d"}, ...options};
    verifyNewickString(newickString);
    // read internal node and then handle root
    let nodeNumber = 0;

    return readBranch(newickString.split("").reverse(), options);
//read the tree backwards pop is O(n) shift is O(n^2)
    // Defining functions here so they have access to options, and node number

    function readExternalNode(stringBuffer, readUntil) {
         let token = readUntil(stringBuffer);
        if(token){
            token = options.tipMap?options.tipMap[token]:stripQuotes(token)
        }
        return {name: token}
    }

    function readInternalNode(stringBuffer) {
        const node = {children: []};
        const openingParenthesis = stringBuffer.pop();
        //grabs the first "(" skipping spaces, but leaves it in the string. read if last character = '\0' pulls the next one else it returns last character and sets it to '\0'
        // skips commends
        if (openingParenthesis !== "(") {
            throw new Error(`Expected '(' but got ${openingParenthesis}`)
        }
        // addChildren
        // look again for other children
        node.children.push(readBranch(stringBuffer))
        let getChildren = true;
        while (getChildren) {
            if (stringBuffer[stringBuffer.length-1] === ")") {
                stringBuffer.pop();
                getChildren = false
            } else if (stringBuffer[stringBuffer.length-1] === ",") {
                stringBuffer.pop();
                node.children.push(readBranch(stringBuffer))
            } else {
                throw new Error("unexpected string")
            }
        }

        return node;
    }

    function readBranch(stringBuffer) {
        // make node
        const [readUntil, getComments] = readUntilFactory(",;():");
        let node = {};
        //check next character if it's '\0' then read it
        if (stringBuffer[stringBuffer.length-1] === '(') {
            // is an internal node
            node = readInternalNode(stringBuffer, options);
        } else {
            // is an external node
            node = readExternalNode(stringBuffer, readUntil);
        }

        //look for label on internal node
        const label = readUntil(stringBuffer);
        //Look for length
        if (stringBuffer[stringBuffer.length-1] === ":") {
            stringBuffer.pop();
            node.length = parseFloat(readUntil(stringBuffer))
        }

        const annotations = getComments().length > 0 ? parseAnnotation(getComments().join("")) : {};

        if (label.length > 0) {
            if (options.labelName!=="label"){
                annotations[options.labelName] = label;
            }else {
                node.label = label
            }
        }
        node.id = node.name ? node.name : node.label ? node.label : `node${(nodeNumber += 1)}`

        let date;

        if (options.datePrefix && node.name) {
            date = getDate(node.name, options.datePrefix, options.dateFormat);
            annotations.date = date;
        }


        node.annotations = annotations;

        const annotationTypes = typeAnnotations(annotations);
        node.annotationTypes = node.children ? [annotationTypes, ...node.children.map(c => c.annotationTypes)].reduce((acc, curr) => reconcileAnnotations(curr, acc), {}) : annotationTypes;
        return node
    }





}