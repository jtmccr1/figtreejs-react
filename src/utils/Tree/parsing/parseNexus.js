import {parseNewick} from "./parseNewick";
import {splitNexusString} from "./treeParsingFunctions";

export function parseNexus(nexus, options = {}) {

    const trees = [];

    // odd parts ensure we're not in a taxon label
    //TODO make this parsing more robust
    const nexusTokens = splitNexusString(nexus);
    const firstToken = nexusTokens.shift().trim();
    if (firstToken.toLowerCase() !== '#nexus') {
        throw Error("File does not begin with #NEXUS is it a nexus file?")
    }
    for (const section of nexusTokens) {
        const workingSection = section.replace(/^\s+|\s+$/g, '').split(/\n/);
        const sectionTitle = workingSection.shift();
        if (sectionTitle.toLowerCase().trim() === "trees;") {
            let inTaxaMap = false;
            const tipMap = {};
            const tipNames = {};
            for (const token of workingSection) {
                if (token.trim().toLowerCase() === "translate") {
                    inTaxaMap = true;
                } else {
                    if (inTaxaMap) {
                        if (token.trim() === ";") {
                            inTaxaMap = false;
                        } else {
                            const taxaData = token.trim().replace(",", "").split(/\s*\s\s*/);
                            tipMap[taxaData[0]] = taxaData[1];
                            tipNames[taxaData[1]] = taxaData[0];
                        }
                    } else {
                        const treeString = token.substring(token.indexOf("("));
                        if (Object.keys(tipMap).length > 0) {
                            const thisTree = parseNewick(treeString, {...options, tipMap, tipNames});
                            trees.push(thisTree);
                        } else {
                            const thisTree = parseNewick(treeString, {...options});
                            trees.push(thisTree);
                        }
                    }
                }
            }
        }
    }
    return trees;
}