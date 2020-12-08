import { getDayOfYear, subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import config from '../../constants/config';
import { IStore } from '../store/use-store';
import D3Timeline, { ITimelineItem } from './d3-element';

const scrollBarWidth = 20;

const D3Component = (props: {
  documentDataStore: IStore['documentDataStore'];
  personDataStore: IStore['personDataStore'];
  timeDataStore: IStore['timeDataStore'];
  data: any;
  dataLinks: any;
  height: number;
  width: number;
  maxDate: Date;
  minDate: Date;
}) => {
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
      <svg ref={d3Container}>
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
  const minDate = new Date(subDays(new Date(), 21));
  const maxDate = new Date(config.endDate);

  const allActivity = props.driveActivityStore
    .getAll()
    .filter((activity) => activity.time > minDate);

  data = data.concat(
    uniqBy(
      allActivity,
      (activity) => `${getDayOfYear(activity.time)}-${activity.actorPersonId}-${activity.link}`,
    ).map((activity) => {
      const document = props.documentDataStore.getByLink(activity.link)!;
      return {
        id: document.id,
        time: activity.time,
        type: 'document',
        imageUrl: document.iconLink!,
        hoverText: document.name || 'no title',
      };
    }),
  );

  const segments = props.timeDataStore.getSegments();

  segments
    .filter((segment) => segment.start > minDate)
    .filter((segment) => segment.formattedAttendees.length < config.ATTENDEE_MAX)
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

  return (
    <div>
      <D3Component
        personDataStore={props.personDataStore}
        documentDataStore={props.documentDataStore}
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
