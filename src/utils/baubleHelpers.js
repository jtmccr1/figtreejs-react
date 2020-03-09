/**
 * This function takes in an attributes object keyed by attributes that will be applied to the bauble.
 * It returns a function that takes a vertex or edge and returns the attributes for that dom element.
 *
 * @param attrs - values can be primitives or functions. if primitive it will apply the attribute to all baubles
 * @return {function(*=): {}}
 */

export function mapAttrsToProps(attrs={}) {
    return function (v) {
        const props = {};
        for (const [key, value] of Object.entries(attrs)) {
            if (typeof value === "function") {
                props[key] = value(v)
            } else {
                props[key] = value;
            }
        }
        return props;
    }

}

export function applyInteractions(fs) {
    return function (v) {
        const props = {};
        for (const [key, value] of Object.entries(fs)) {
                props[key] = ()=>value(v)
        }
        return props;
    }

}