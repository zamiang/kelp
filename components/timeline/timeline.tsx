import { makeStyles } from '@material-ui/core/styles';
import { uniq, uniqBy } from 'lodash';
import React, { useEffect, useRef } from 'react';
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
  const classes = useStyles();
  const d3Container = useRef(null);
  const tooltipRef = useRef(null);
  useEffect(() => {
    new D3Timeline({
      data: props.data,
      dataLinks: props.dataLinks,
      width: props.width - scrollBarWidth,
      height: props.height,
      tooltipRef,
      selector: d3Container?.current,
    });
  }, [props.data, d3Container.current]);

  return (
    <React.Fragment>
      <svg className="d3-component" ref={d3Container} />
      <div className={classes.tooltip} style={{ opacity: 0 }} ref={tooltipRef} />
    </React.Fragment>
  );
};

const Timeline = (props: IStore & { height: number; width: number }) => {
  let data: ITimelineItem[] = [];
  const personIds: string[] = [];
  data = data.concat(
    props.driveActivityStore.getAll().map((activity) => {
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

  segments.map((segment) => {
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

  const graph = {} as any;

  uniq(personIds).map((p) => {
    const person = props.personDataStore.getPersonById(p)!;
    let linksData = props.personDataStore
      .getAssociates(person.id, segments)
      .filter((associate) => !associate.self)
      .map((associate) => ({
        source: person.id,
        target: props.personDataStore.getPersonById(associate.personId)!.id,
        type: 'person',
      }));

    linksData = linksData.concat(
      uniqBy(
        Object.values(person.driveActivity).map((activity) =>
          props.documentDataStore.getByLink(activity.link),
        ),
        'id',
      ).map((document) => ({ source: person.id, target: document!.id, type: 'document' })),
    );
    graph[p.id] = linksData;
  });

  return (
    <div>
      <D3Component data={data} dataLinks={graph} width={props.width} height={props.height} />;
    </div>
  );
};

export default Timeline;
