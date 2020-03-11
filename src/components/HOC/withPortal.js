import ReactDOM from "react-dom";

function withPortal(WrappedComponent){
    return function WithPortal(props){
        return ReactDOM.createPortal(
            this.props.children,
            domNode
        );
    }
}