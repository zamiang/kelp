import { getDayOfYear, subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import config from '../../constants/config';
import { IStore } from '../store/use-store';
import D3Timeline, { ITimelineItem } from './d3-element';

const scrollBarWidth = 20;

export interface ISetCurrentElement {
  id: string | null;
  index: number | null;
  type: 'document' | 'person' | null;
}

const D3Component = (props: {
  data: any;
  dataLinks: any;
  height: number;
  width: number;
  setCurrentElement: (args: ISetCurrentElement) => void;
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
          setCurrentElement: props.setCurrentElement,
        }),
      ),
    [d3Container],
  );

  if (timeline) {
    timeline.updateNodesFromProps({ data: props.data });
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
  const [currentElement, setCurrentElement] = useState<ISetCurrentElement>({
    id: null,
    index: null,
    type: null,
  });
  let data: ITimelineItem[] = [];
  const personIds: string[] = [];
  let linksData: link[] = [];
  const startDate = new Date(subDays(new Date(), 14));
  const allActivity = props.driveActivityStore
    .getAll()
    .filter((activity) => activity.time > startDate);

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
    .filter((segment) => segment.start > startDate)
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

  const idToIndexHash: { [id: string]: number } = {};
  data.map((d, index) => {
    idToIndexHash[d.id] = index;
  });

  if (currentElement.type === 'person' && currentElement.id && currentElement.index) {
    const person = props.personDataStore.getPersonById(currentElement.id)!;
    const personSegments = person.segmentIds
      .map((segmentId) => props.timeDataStore.getSegmentById(segmentId))
      .filter((segment) => segment!.start > startDate);

    linksData = linksData.concat(
      props.personDataStore
        .getAssociates(person.id, personSegments)
        .filter((associate) => !associate.self)
        .filter(
          (associate) =>
            idToIndexHash[person.id] &&
            idToIndexHash[props.personDataStore.getPersonById(associate.personId)!.id],
        )
        .map((associate) => ({
          source: currentElement.index!,
          target: idToIndexHash[props.personDataStore.getPersonById(associate.personId)!.id],
        })),
    );

    linksData = linksData.concat(
      uniqBy(
        Object.values(person.driveActivity).map((activity) =>
          props.documentDataStore.getByLink(activity.link),
        ),
        'id',
      ).map((document) => ({
        source: currentElement.index!,
        target: idToIndexHash[document!.id],
      })),
    );
  }

  return (
    <div>
      <D3Component
        setCurrentElement={setCurrentElement}
        data={data}
        dataLinks={linksData}
        width={props.width}
        height={props.height}
      />
    </div>
  );
};

export default Timeline;
