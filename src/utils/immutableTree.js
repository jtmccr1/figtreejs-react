export default class ImmutableTree{
    constructor(nodes){
        this.nodes = {};

    }

    // Set node number in alphabetical order

    static parseNewick(newickString, options={}) {
        options ={...{labelName: "label",datePrefix:undefined,dateFormat:"decimal"},...options}

        //strip first and last parenthesis and annotations ect. call again on children.
//https://www.regextester.com/103043
        const initialRegex =/\((.*)\)(.*)/gm;
        const childrenCommas=/,(?=(?:(?:(?!\)).)*\()|[^\(\)]*$)/g;
        const match = initialRegex.exec(newickString);

        // if not match check for tip signiture (.*):(.*)

        // if(match){
            const [childrenString,data] = match.slice(1,3);
            const splits = childrenCommas.exec(childrenString);
        let match2
        while ((match2 = childrenCommas.exec(childrenString)) !=null) {
            console.log("match found at " + match.index);

            }
            // const children = splits.map((d,i)=>{
            //     if(i===0){
            //         return childrenString.substring(0,d.index)
            //     }else{
            //         return childrenString.substring(splits[i-1].index,d.index)
            //     }
            // });




            //split children and process; can check for tip here
            // console.log(children);
            // process data here
            console.log(data)
        // }





        const node = {}



    }




}
