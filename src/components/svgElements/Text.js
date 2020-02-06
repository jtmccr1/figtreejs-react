import React from "react"
// import {useSpring, animated} from 'react-spring'

export default function Text(props){
	// useSpring(props);
	const {text,...attrs}=props;
	return <text {...attrs} >{text}</text>
}
