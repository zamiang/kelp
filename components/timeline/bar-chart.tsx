import { makeStyles } from '@material-ui/core/styles';
import { addDays, format, subDays } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import config from '../../constants/config';
import { IStore } from '../store/use-store';
import D3BarChart, { IBarChartItem } from './d3-bar-chart';

const scrollBarWidth = 20;
const dateFormat = 'MM/dd/yyyy';

const useStyles = makeStyles((theme) => ({
  barChart: {
    padding: theme.spacing(2),
  },
}));

const d3Styles = makeStyles(() => ({
  svg: {
    '& .background': {
      fill: 'url(#background-gradient)',
      shapeRendering: 'geometricPrecision',
    },
    '& .axis path, & .axis line': {
      display: 'none',
    },
    '&.tick text': {
      fill: '#fff',
    },
    '& .date-line': {
      fill: 'none',
      stroke: '#fff',
      strokeOpacity: 0.6,
      strokeWidth: 1,
      shapeRendering: 'crispEdges',
    },
    '& .bar': {
      fill: '#fff',
      fillOpacity: 0.3,
    },
    '& .label-small': {
      fill: '#fff',
      fillOpacity: 1,
      fontSize: 12,
    },
    '& .label-large': {
      fill: '#fff',
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

const D3Component = (props: {
  data: IBarChartItem[];
  height: number;
  width: number;
  maxDate: Date;
  minDate: Date;
  startGradient: string;
  endGradient: string;
}) => {
  const classes = d3Styles();
  const d3Container = useRef(null);
  const [barChart, setBarChart] = useState<any>(null);

  useEffect(
    () =>
      setBarChart(
        new D3BarChart({
          data: props.data,
          width: props.width - scrollBarWidth,
          height: props.height,
          selector: d3Container?.current,
          minDate: props.minDate,
          maxDate: props.maxDate,
          label: 'Document edits',
          smallLabel: 'edits',
          startGradient: props.startGradient,
          endGradient: props.endGradient,
        }),
      ),
    [d3Container],
  );

  if (barChart) {
    barChart.updateNodesFromProps({
      data: props.data,
    });
  }

  return (
    <React.Fragment>
      <svg ref={d3Container} className={classes.svg}></svg>
    </React.Fragment>
  );
};

const startGradientHash = {
  meetings: config.BLUE_BACKGROUND,
  documents: config.PINK_BACKGROUND,
  'different-people': config.ORANGE_BACKGROUND,
};

const endGradientHash = {
  meetings: config.BLUE_BACKGROUND,
  documents: config.PINK_BACKGROUND,
  'different-people': config.ORANGE_BACKGROUND,
};

const BarChart = (
  props: IStore & {
    type: 'meetings' | 'documents' | 'different-people';
    height: number;
    width: number;
  },
) => {
  const classes = useStyles();
  const minDate = new Date(subDays(new Date(), 12));
  const maxDate = new Date(addDays(new Date(), 2));

  const allActivity = props.driveActivityStore
    .getAll()
    .filter((activity) => activity.time > minDate);

  const activityDocuments = {} as any;

  allActivity.map((activity) => {
    // TOOD: potentially filter them?
    const date = format(activity.time, dateFormat);
    if (activityDocuments[date]) {
      activityDocuments[date].rate++;
    } else {
      activityDocuments[date] = {
        date: activity.time,
        rate: 1,
        type: 'document',
      };
    }
  });

  return (
    <div className={classes.barChart}>
      <D3Component
        data={Object.values(activityDocuments)}
        width={props.width}
        height={props.height}
        minDate={minDate}
        maxDate={maxDate}
        startGradient={startGradientHash[props.type]}
        endGradient={endGradientHash[props.type]}
      />
    </div>
  );
};

export default BarChart;
