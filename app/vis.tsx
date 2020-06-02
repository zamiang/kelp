import React from "react";
import { googleState, styles } from "./app";

interface IProps {
  classes: styles;
  googleLoginState: googleState;
}

const Vis = (props: IProps) => {
  const classes = props.classes;
  console.log(props.googleLoginState, "<<<<<<<<<<<");
  return <div className={classes.wrapper}>omg</div>;
};

export default Vis;
