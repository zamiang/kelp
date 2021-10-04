import { styled } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { useRef } from 'react';
import D3BarChart, { IBarChartItem } from './d3-bar-chart';

const PREFIX = 'D3Component';

const classes = {
  svg: `${PREFIX}-svg`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.svg}`]: {
    fill: 'white',
    '& .background': {
      shapeRendering: 'geometricPrecision',
    },
    '& .axis path, & .axis line': {
      display: 'none',
    },
    '& .tick text': {
      fill: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
    },
    '& .date-line': {
      fill: 'none',
      stroke: theme.palette.divider,
      strokeOpacity: 0.6,
      strokeWidth: 1,
      shapeRendering: 'crispEdges',
    },
    '& .bar': {
      fill: '#828282',
      transition: 'fill 0.3s',
      fillOpacity: 0.3,
      cursor: 'pointer',
      '&:hover': {
        fill: 'purple',
      },
    },
    '& .weekend': {
      opacity: 0.5,
    },
    '& .today': {
      textDecoration: 'underline',
    },
    '& .label-small': {
      fill: theme.palette.text.secondary,
      fillOpacity: 1,
      fontSize: 12,
    },
    '& .label-large': {
      fill: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
      fillOpacity: 1,
      fontSize: 16,
    },
    '& icon': {
      fill: '#fff',
      stroke: '#fff',
      strokeWidth: 1.5,
      shapeRendering: 'geometricPrecision',
    },
  },
}));

const scrollBarWidth = 20;

const d3Styles = makeStyles(({ theme }) => ({
  [`& .${classes.svg}`]: {
    fill: 'white',
    '& .background': {
      shapeRendering: 'geometricPrecision',
    },
    '& .axis path, & .axis line': {
      display: 'none',
    },
    '& .tick text': {
      fill: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
    },
    '& .date-line': {
      fill: 'none',
      stroke: theme.palette.divider,
      strokeOpacity: 0.6,
      strokeWidth: 1,
      shapeRendering: 'crispEdges',
    },
    '& .bar': {
      fill: '#828282',
      transition: 'fill 0.3s',
      fillOpacity: 0.3,
      cursor: 'pointer',
      '&:hover': {
        fill: 'purple',
      },
    },
    '& .weekend': {
      opacity: 0.5,
    },
    '& .today': {
      textDecoration: 'underline',
    },
    '& .label-small': {
      fill: theme.palette.text.secondary,
      fillOpacity: 1,
      fontSize: 12,
    },
    '& .label-large': {
      fill: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
      fillOpacity: 1,
      fontSize: 16,
    },
    '& icon': {
      fill: '#fff',
      stroke: '#fff',
      strokeWidth: 1.5,
      shapeRendering: 'geometricPrecision',
    },
  },
}));

export const D3Component = (props: {
  data: IBarChartItem[];
  height: number;
  width: number;
  maxDate: Date;
  minDate: Date;
  label: string;
  smallLabel: string;
}) => {
  const classes = d3Styles();
  const d3Container = useRef(null);

  new D3BarChart({
    data: props.data,
    width: props.width - scrollBarWidth,
    height: props.height,
    selector: d3Container?.current,
    minDate: props.minDate,
    maxDate: props.maxDate,
    startGradient: 'rgba(0,0,0,0.12)', // todo
    endGradient: 'rgba(0,0,0,0.12)', // todo
    smallLabel: props.smallLabel,
    label: props.label,
  });

  return (
    <Root>
      <svg ref={d3Container} className={classes.svg}></svg>
    </Root>
  );
};
