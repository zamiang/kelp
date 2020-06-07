import Typography from '@material-ui/core/Typography';
import React from 'react';

interface IProps {
  children: string;
}

const Title = (props: IProps) => (
  <Typography component="h2" variant="h6" color="primary" gutterBottom>
    {props.children}
  </Typography>
);

export default Title;
