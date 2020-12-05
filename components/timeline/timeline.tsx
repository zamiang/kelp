import React, { useEffect } from 'react';
import { getWeek } from '../shared/date-helpers';
import { IStore } from '../store/use-store';
import D3Timeline, { ITimelineItem } from './d3-element';

const chartId = 'd3-chart';
let hasRun = false;

const Timeline = (props: IStore & { height: number; width: number }) => {
  useEffect(initVis, [props.height, props.width]);

  const currentDate = new Date();

  function initVis() {
    let data: ITimelineItem[] = [];

    data = data.concat(
      props.driveActivityStore.getAll().map((activity) => {
        const document = props.documentDataStore.getByLink(activity.link)!;
        return {
          time: activity.time,
          type: 'document',
          icon: document.iconLink!,
          hoverText: document.name || 'no title',
        };
      }),
    );

    data = data.concat(
      props.timeDataStore.getSegmentsForWeek(getWeek(currentDate)).map((segment) => ({
        time: segment.start,
        end: segment.end,
        icon: 'foo',
        hoverText: segment.summary!,
        type: 'meeting',
      })),
    );
    if (hasRun) {
      return;
    }
    new D3Timeline({
      data,
      width: props.width,
      height: props.height,
    });
    hasRun = true;
  }
  return <div id={chartId} />;
};

export default Timeline;
