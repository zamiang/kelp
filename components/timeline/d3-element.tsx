import {
  D3ZoomEvent,
  axisBottom,
  axisLeft,
  extent,
  pointer,
  scaleBand,
  scaleTime,
  select,
  zoom,
  zoomIdentity,
  zoomTransform,
} from 'd3';
import { subWeeks } from 'date-fns';

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
}

class D3Timeline {
  props: IProps;
  margin = {
    top: 20,
    bottom: 20,
    left: 60,
    right: 0,
  };

  constructor(props: IProps) {
    this.props = props;
    const width = props.width - this.margin.left - this.margin.right;
    const height = props.height - this.margin.top - this.margin.bottom;

    const maxDate = new Date();
    const minDate = subWeeks(maxDate, 1);

    const svg = select(chartId)
      .append('svg')
      .attr('height', props.height)
      .attr('width', props.width)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

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

    // add data
    const dots = svg
      .selectAll('circle')
      .data(props.data)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('cy', (d) => yName(d.type));

    function redraw() {
      const xr = tx().rescaleX(xscale);
      gx.call(xaxis, xr);

      dots.attr('cx', (d) => xr(d.time)).attr('rx', 6 * Math.sqrt(tx().k));
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
