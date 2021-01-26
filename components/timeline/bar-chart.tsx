import { makeStyles } from '@material-ui/core/styles';
import useComponentSize from '@rehooks/component-size';
import { addDays, differenceInCalendarDays, differenceInMinutes, format, subDays } from 'date-fns';
import { times } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import config from '../../constants/config';
import { IStore } from '../store/use-store';
import D3BarChart, { IBarChartItem } from './d3-bar-chart';

const scrollBarWidth = 20;
const dateFormat = 'MM/dd/yyyy';

const useStyles = makeStyles(() => ({
  barChart: {
    width: '100%',
  },
}));

const d3Styles = makeStyles((theme) => ({
  svg: {
    '& .background': {
      shapeRendering: 'geometricPrecision',
    },
    '& .axis path, & .axis line': {
      display: 'none',
    },
    '& .tick text': {
      fill: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightBold,
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
    '& .label-small': {
      fill: theme.palette.text.secondary,
      fillOpacity: 1,
      fontSize: 12,
    },
    '& .label-large': {
      fill: theme.palette.text.secondary,
      fontWeight: theme.typography.fontWeightBold,
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
    startGradient: props.startGradient,
    endGradient: props.endGradient,
    smallLabel: props.smallLabel,
    label: props.label,
  });

  return (
    <React.Fragment>
      <svg ref={d3Container} className={classes.svg}></svg>
    </React.Fragment>
  );
};

const startGradientHash = {
  meetings: config.BLUE_BACKGROUND,
  documents: config.PINK_BACKGROUND,
  people: config.ORANGE_BACKGROUND,
};

const endGradientHash = {
  meetings: config.BLUE_BACKGROUND,
  documents: config.PINK_BACKGROUND,
  people: config.ORANGE_BACKGROUND,
};

const labelHash = {
  meetings: 'Minutes in meetings',
  documents: 'Document edits',
  people: 'People met with',
};

const smallLabelHash = {
  meetings: 'meetings',
  documents: 'edits',
  people: 'met',
};

const getDataForType = async (
  props: IStore & { type: 'meetings' | 'documents' | 'people' },
  minDate: Date,
  maxDate: Date,
) => {
  if (props.type === 'documents') {
    let allActivity = await props.driveActivityStore.getAll();
    allActivity = allActivity.filter((activity) => activity.time > minDate);

    const activityDocuments = {} as any;
    times(differenceInCalendarDays(maxDate, minDate), (interval: number) => {
      const date = addDays(minDate, interval);
      const dateFormatted = format(date, dateFormat);
      activityDocuments[dateFormatted] = {
        rate: 0,
        date,
        type: 'document',
      };
    });

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
    return Object.values(activityDocuments);
  } else if (props.type === 'meetings') {
    let allMeetings = await props.timeDataStore.getSegments();
    allMeetings = allMeetings.filter((segment) => segment.start > minDate);
    const meetingCount = {} as any;
    times(differenceInCalendarDays(maxDate, minDate), (interval: number) => {
      const date = addDays(minDate, interval);
      const dateFormatted = format(date, dateFormat);
      meetingCount[dateFormatted] = {
        rate: 0,
        date,
        type: 'segment',
      };
    });
    allMeetings.map((segment) => {
      // TOOD: potentially filter them?
      const date = format(segment.start, dateFormat);
      const duration = differenceInMinutes(segment.end, segment.start);
      if (meetingCount[date]) {
        meetingCount[date].rate += duration;
      } else {
        meetingCount[date] = {
          date: segment.start,
          rate: duration,
          type: 'document',
        };
      }
    });
    return Object.values(meetingCount);
  } else {
    const allMeetings = await props.timeDataStore.getSegments();
    allMeetings.filter((segment) => segment.start > minDate);
    const peopleCount = {} as any;
    times(differenceInCalendarDays(maxDate, minDate), (interval: number) => {
      const date = addDays(minDate, interval);
      const dateFormatted = format(date, dateFormat);
      peopleCount[dateFormatted] = {
        rate: 0,
        date,
        type: 'segment',
      };
    });
    allMeetings.map((segment) => {
      // TOOD: potentially filter them?
      const date = format(segment.start, dateFormat);
      const count = segment.attendees.length;
      if (peopleCount[date]) {
        peopleCount[date].rate += count;
      } else {
        peopleCount[date] = {
          date: segment.start,
          rate: count,
          type: 'document',
        };
      }
    });
    return Object.values(peopleCount);
  }
};

const BarChart = (
  props: IStore & {
    type: 'meetings' | 'documents' | 'people';
  },
) => {
  const ref = useRef(null);
  const size = useComponentSize(ref);
  const classes = useStyles();
  const minDate = new Date(subDays(new Date(), 12));
  const maxDate = new Date(addDays(new Date(), 2));
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = (await getDataForType(props, minDate, maxDate)) as any;
      setData(result);
    };
    void fetchData();
  }, [props.type]);

  return (
    <div className={classes.barChart} ref={ref}>
      <D3Component
        data={data}
        width={size.width < 300 ? 300 : size.width}
        height={300}
        minDate={minDate}
        maxDate={maxDate}
        startGradient={startGradientHash[props.type]}
        endGradient={endGradientHash[props.type]}
        label={labelHash[props.type]}
        smallLabel={smallLabelHash[props.type]}
      />
    </div>
  );
};

export default BarChart;
