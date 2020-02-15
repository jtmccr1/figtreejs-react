export function mapAttrsToProps(attrs) {
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