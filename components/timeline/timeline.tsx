import { makeStyles } from '@material-ui/core/styles';
import { addDays, getDayOfYear, subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { IStore } from '../store/use-store';
import D3Timeline, { ITimelineItem } from './d3-timeline';

const scrollBarWidth = 20;

const d3Styles = makeStyles((theme) => ({
  svg: {
    '& line': {
      stroke: theme.palette.divider,
    },
    '& text': {
      textAnchor: 'middle',
      fontFamily: theme.typography.fontFamily,
      fill: '#B8B8B8',
      fontSize: theme.typography.body2.fontSize,
    },
    '& .document circle': {
      fill: '#747C81',
    },
    '& .meeting circle': {
      fill: '#747C81',
    },
    '& .person circle': {
      fill: '#747C81',
    },
    '& .node .nodetext': {
      display: 'none',
    },
    '& .node:hover .nodetext': {
      display: 'block',
    },
    '& .node:hover circle': {
      r: 20,
    },
    '& .node': {
      position: 'relative',
    },
    '& .node circle': {
      transition: 'r 0.3s',
    },
    '& .tick text, .nodetext': {
      fill: '#747C81',
    },
    '& .avatar': {
      fill: theme.palette.background.paper,
      fontWeight: theme.typography.fontWeightBold,
    },
    '& .domain': {
      display: 'none',
    },
  },
}));

const D3Component = (props: {
  documentDataStore: IStore['documentDataStore'];
  personDataStore: IStore['personDataStore'];
  timeDataStore: IStore['timeDataStore'];
  driveActivityStore: IStore['driveActivityStore'];
  data: any;
  dataLinks: any;
  height: number;
  width: number;
  maxDate: Date;
  minDate: Date;
}) => {
  const classes = d3Styles();
  const d3Container = useRef(null);
  const [timeline, setTimeline] = useState<any>(null);

  useEffect(
    () =>
      setTimeline(
        new D3Timeline({
          data: props.data,
          dataLinks: props.dataLinks,
          width: props.width - scrollBarWidth,
          height: props.height,
          selector: d3Container?.current,
          driveActivityStore: props.driveActivityStore,
          personDataStore: props.personDataStore,
          documentsDataStore: props.documentDataStore,
          timeDataStore: props.timeDataStore,
          minDate: props.minDate,
          maxDate: props.maxDate,
        }),
      ),
    [d3Container],
  );

  if (timeline) {
    timeline.updateNodesFromProps({
      personDataStore: props.personDataStore,
      documentsDataStore: props.documentDataStore,
      timeDataStore: props.timeDataStore,
      data: props.data,
    });
  }

  return (
    <React.Fragment>
      <svg ref={d3Container} className={classes.svg}>
        <clipPath id="circle" clipPathUnits="objectBoundingBox">
          <circle cx=".5" cy=".5" r=".5" />
        </clipPath>
        <g className="links"></g>
        <g className="nodes"></g>
      </svg>
    </React.Fragment>
  );
};

type link = {
  source: number;
  target: number;
};

const Timeline = (props: IStore & { height: number; width: number }) => {
  let data: ITimelineItem[] = [];
  const personIds: string[] = [];
  const linksData: link[] = [];
  const minDate = new Date(subDays(new Date(), 12));
  const maxDate = new Date(addDays(new Date(), 2));

  const allActivity = props.driveActivityStore
    .getAll()
    .filter((activity) => activity.time > minDate);

  const activityDocuments = uniqBy(
    allActivity,
    (activity) => `${getDayOfYear(activity.time)}-${activity.actorPersonId}-${activity.link}`,
  )
    .map((activity) => {
      const document = props.documentDataStore.getByLink(activity.link);
      if (document) {
        return {
          id: document.id,
          time: activity.time,
          type: 'document',
          imageUrl: document.iconLink!,
          hoverText: document.name || 'no title',
        };
      }
    })
    .filter(Boolean) as ITimelineItem[];

  data = data.concat(activityDocuments);
  const segments = props.timeDataStore.getSegments();

  segments
    .filter((segment) => segment.start > minDate)
    .map((segment) => {
      data = data.concat(
        segment.formattedAttendees
          .filter((a) => !a.self)
          .map((attendee) => {
            const person = props.personDataStore.getPersonById(attendee.personId)!;
            personIds.push(person.id);
            return {
              id: person.id,
              time: segment.start,
              imageUrl: person.imageUrl!,
              hoverText: person.name || person.emailAddresses[0],
              type: 'person',
            };
          }),
      );
    });

  data = uniqBy(data, (item) => `${getDayOfYear(item.time)}-${item.id}`);

  return (
    <div>
      <D3Component
        personDataStore={props.personDataStore}
        documentDataStore={props.documentDataStore}
        driveActivityStore={props.driveActivityStore}
        timeDataStore={props.timeDataStore}
        data={data}
        dataLinks={linksData}
        width={props.width}
        height={props.height}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
};

export default Timeline;
