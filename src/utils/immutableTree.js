export default class ImmutableTree{
    constructor(nodes){
        this.nodes = {};

    }

    // Set node number in alphabetical order

    static parseNewick(newickString, options={}) {
        options ={...{labelName: "label",datePrefix:undefined,dateFormat:"decimal"},...options};

        let nodeCount=0;

        function newickSubstringParser(newickString){
            // check for semicolon
            //strip first and last parenthesis and annotations ect. call again on children.
//https://www.regextester.com/103043
            //                      [children]data - name, label, branch length ect.
            const internalNode =/\((.*)\)(.*)/;
            // identify commas not included in (),[],or {}
            const exposedCommas=/,(?=(?:(?:(?![\)]).)*[\(])|[^\(\)]*$)(?=(?:(?:(?![\]]).)*[\[])|[^\[\]]*$)(?=(?:(?:(?![\}]).)*[\{])|[^\{\{]*$)/g;
            const nodeData = /(.*?)(?:\[&?(.*)\])*(?:#(.+))*:(\d*\.?\d*)/g

            const isInternalNode = internalNode.test(newickString);
            let nodeString,
                childrenString,
                childNodes=[];
            if(isInternalNode){
                [childrenString,nodeString] = newickString.split(internalNode).filter(s=>s);
                const children = childrenString.split(exposedCommas);
                for(const child of children){
                   childNodes=childNodes.concat(newickSubstringParser(child))
                }
            }else{
                //Add tip to tip list
                nodeString = newickString;
            }

            //TODO get rid of leading and trailing empty matches
            const [emptyMatch,name,annotations,label,length,emptyMatch2]=nodeString.split(nodeData);

            const node = {
                id:name?name:label?label:(`node${(nodeCount+=1)}`),
                name:name?name:null,
                label:label?label:null,
                length:length!==undefined?parseInt(length):1,
                annotations:annotations?annotations:null,
                children:childNodes.length>0?childNodes.map(n=>n.id):null,
            };

            return {[node.id]:node,...childNodes}

        }
        return newickSubstringParser(newickString);
    }




}

