import {
  D3ZoomEvent,
  axisBottom,
  axisLeft,
  extent,
  pointer,
  scaleBand,
  scaleTime,
  select,
  selectAll,
  zoom,
  zoomIdentity,
  zoomTransform,
} from 'd3';
import { subWeeks } from 'date-fns';
import config from '../../constants/config';
import { useStyles } from './timeline';

const chartId = '#d3-chart';

export interface ITimelineItem {
  time: Date;
  icon: string;
  end?: Date;
  type: 'document' | 'person' | 'meeting';
  hoverText: string;
}

interface IProps {
  width: number;
  height: number;
  data: ITimelineItem[];
  classes: ReturnType<typeof useStyles>;
}

const colorHash = {
  document: config.PINK_BACKGROUND,
  meeting: config.BLUE_BACKGROUND,
  person: config.YELLOW_BACKGROUND,
};

const margin = {
  top: 20,
  bottom: 20,
  left: 60,
  right: 0,
};

class D3Timeline {
  constructor(props: IProps) {
    const width = props.width - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    const maxDate = new Date();
    const minDate = subWeeks(maxDate, 1);

    const svg = select(chartId)
      .append('svg')
      .attr('height', props.height)
      .attr('width', props.width)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const rows = ['  ', 'meeting', 'document', 'person', '     '];

    const gx = svg
      .append('g')
      .attr('pointer-events', 'none')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`);

    // z holds a copy of the previous transform, so we can track its changes
    let z = zoomIdentity;

    // Add x axis
    const xscale = scaleTime([minDate, maxDate], [0, width]);
    const xaxis = (g: any, scale: any) => g.call(axisBottom(scale)).select('.domain').remove();

    // Add y axis
    const yName = scaleBand().domain(rows).range([0, height]).paddingInner(1);
    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('pointer-events', 'none')
      .call(axisLeft(yName).tickSize(0))
      .select('.domain')
      .remove();

    // Setup domain
    xscale.domain(extent(props.data, (d) => d.time) as any);

    // set up the ancillary zooms and an accessor for their transforms
    const zoomX = zoom().scaleExtent([0.5, 10]);

    const tx = () => zoomTransform(gx.node()!);
    gx.call(zoomX as any);

    // Define the div for the tooltip
    const tooltip = select('body')
      .append('div')
      .attr('class', props.classes.tooltip)
      .style('opacity', 0);

    // add data
    svg
      .selectAll('.node')
      .data(props.data)
      .enter()
      .append('g')
      .attr('class', (d) => d.type + ' node');

    const meetings = selectAll('.meeting')
      .append('rect')
      .attr('width', 50)
      .attr('height', 30)
      .attr('rx', 6)
      .attr('ry', 6)
      .style('fill', '#fff')
      .style('stroke', (d) => colorHash[d.type] as any)
      .on('mouseover', (event: any, d: ITimelineItem) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(d.hoverText)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      });

    const documents = selectAll('.document')
      .append('circle')
      .attr('r', 10)
      .attr('cy', (d) => yName(d.type) as any)
      .style('fill', 'url(#document)')
      .style('stroke', (d) => colorHash[d.type] as any)
      .on('mouseover', (event: any, d: ITimelineItem) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(d.hoverText)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      });
    function redraw() {
      const xr = tx().rescaleX(xscale);
      gx.call(xaxis, xr);

      documents.attr('cx', (d) => xr(d.time)).attr('rx', 6 * Math.sqrt(tx().k));
      meetings.attr('x', (d) => xr(d.time)); // .attr('rx', 6 * Math.sqrt(tx().k));
    }

    const zoomSetup = zoom().on('zoom', function (event: D3ZoomEvent<any, any>) {
      const t = event.transform;
      const k = t.k / z.k;
      const point = event.sourceEvent ? pointer(event) : [width, height / 2];
      const shouldDoX = point[0] > xscale.range()[0];

      if (k === 1) {
        // pure translation?
        shouldDoX && gx.call(zoomX.translateBy, (t.x - z.x) / tx().k, 0);
      } else {
        // if not, we're zooming on a fixed point
        shouldDoX && gx.call(zoomX.scaleBy, k, point);
      }
      z = t;
      redraw();
    });

    svg.call(zoomSetup).transition().call(zoomSetup.transform, zoomIdentity.scale(20));
  }
}

export default D3Timeline;
