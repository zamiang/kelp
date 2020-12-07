import { makeStyles } from '@material-ui/core/styles';
import { getDayOfYear, subDays } from 'date-fns';
import { uniq, uniqBy } from 'lodash';
import React, { useEffect, useRef } from 'react';
import config from '../../constants/config';
import { IStore } from '../store/use-store';
import D3Timeline, { ITimelineItem } from './d3-element';

const scrollBarWidth = 20;

export const useStyles = makeStyles((theme) => ({
  tooltip: {
    position: 'absolute',
    textAlign: 'center',
    padding: theme.spacing(1),
    borderRadius: 2,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    bordeRadius: 8,
    pointerEvents: 'none',
  },
}));

const D3Component = (props: { data: any; dataLinks: any; height: number; width: number }) => {
  const d3Container = useRef(null);
  useEffect(() => {
    new D3Timeline({
      data: props.data,
      dataLinks: props.dataLinks,
      width: props.width - scrollBarWidth,
      height: props.height,
      selector: d3Container?.current,
    });
  }, [props.data, d3Container.current]);

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

  uniq(personIds).map((p) => {
    const person = props.personDataStore.getPersonById(p)!;
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
          source: idToIndexHash[person.id],
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
        source: idToIndexHash[person.id],
        target: idToIndexHash[document!.id],
      })),
    );
  });

  return (
    <div>
      <D3Component data={data} dataLinks={linksData} width={props.width} height={props.height} />
    </div>
  );
};

export default Timeline;
