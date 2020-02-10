export default class ImmutableTree{
    constructor(nodes){
        this.nodes = {};

    }

    // Set node number in alphabetical order

    static parseNewick(newickString, options={}) {
        options ={...{labelName: "label",datePrefix:undefined,dateFormat:"decimal"},...options}

        //strip first and last parenthesis and annotations ect. call again on children.
//https://www.regextester.com/103043
        const internalNode =/\((.*)\)(.*)/;
        const exposedCommas=/,(?=(?:(?:(?![\)]).)*[\(])|[^\(\)]*$)(?=(?:(?:(?![\]]).)*[\[])|[^\[\]]*$)(?=(?:(?:(?![\}]).)*[\{])|[^\{\{]*$)/g;
        const annotations = /(.*?)(?:\[&?(.*)\])*(?:#(.+))*:(\d*\.?\d*)/g

        if(internalNode.test(newickString)){
            const [childrenString,data] = newickString.split(internalNode).filter(s=>s);
            const children = childrenString.split(exposedCommas);
            console.log(children)

            console.log(data.split(annotations))
        }else{
            // it's a tip parse for data.
        }



        const node = {}



    }




}
