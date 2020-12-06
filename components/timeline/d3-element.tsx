import {
  axisBottom,
  extent,
  forceCollide,
  forceLink,
  forceSimulation,
  forceX,
  forceY,
  path,
  scaleBand,
  scaleTime,
  select,
  selectAll,
  zoom,
  zoomTransform,
} from 'd3';
import { subWeeks } from 'date-fns';
import { flatten } from 'lodash';
import config from '../../constants/config';

export interface ITimelineItem {
  id: string;
  time: Date;
  imageUrl: string;
  end?: Date;
  type: 'document' | 'person' | 'meeting';
  hoverText: string;
}

interface IDataLink {
  source: string;
  target: string;
  type: string;
}

interface IProps {
  width: number;
  height: number;
  data: ITimelineItem[];
  dataLinks: { [key: string]: IDataLink };
  selector: any;
  tooltipRef: any;
}

const colorHash = {
  document: config.PINK_BACKGROUND,
  meeting: config.BLUE_BACKGROUND,
  person: config.YELLOW_BACKGROUND,
};

const radius = 20;
const margin = {
  top: 0,
  bottom: 20,
  left: 0,
  right: 0,
};

const ticked = () => {
  const u = svg.selectAll('circle').data(nodes);

  u.enter()
    .append('g')
    .merge(u as any)
    .attr('cx', (d: any) => d.x) //  add if needing x bounding box = Math.max(d.radius, Math.min(width - d.radius, d.x))))
    .attr('cy', (d: any) => (d.y = Math.max(d.radius, Math.min(height - d.radius, d.y))))
    .attr('class', (d) => d.type + ' node')
    .attr('r', (d) => d.radius)
    .style('stroke', (d: any) => d.stroke);

  u.exit().remove();

  const link = selectAll('.link').data(dataLinksValues);

  link
    .enter()
    .merge(link as any)
    .style('stroke', (d: any) => '#000000')
    .attr('x1', function (d) {
      return d.source.x;
    })
    .attr('y1', function (d) {
      return d.source.y;
    })
    .attr('x2', function (d) {
      return d.target.x;
    })
    .attr('y2', function (d) {
      return d.target.y;
    });

  // console.log(path);
};

const setupZoom = () => {
  /*
    // z holds a copy of the previous transform, so we can track its changes
    // let z = zoomIdentity;

    const zoomSetup = zoom().on('zoom', function (event: D3ZoomEvent<any, any>) {
      const t = event.transform;
      const k = t.k / z.k;
      const point = event.sourceEvent ? pointer(event) : [width, height / 2];
      const shouldDoX = point[0] > xScale.range()[0];

      if (k === 1) {
        // pure translation?
        shouldDoX && xAxisSvg.call(zoomX.translateBy as any, (t.x - z.x) / tx().k, 0);
      } else {
        // if not, we're zooming on a fixed point
        shouldDoX && xAxisSvg.call(zoomX.scaleBy as any, k, point);
      }
      z = t;
      redraw();
    });

    svg
      .call(zoomSetup as any)
      .transition()
      .call(zoomSetup.transform as any, zoomIdentity.scale(20));
*/
};

const addIcons = () => {
  // Add icons
  /*
    const paths = [
      {
        id: 'document',
        fill: config.PURPLE_BACKGROUND,
        stroke: config.PURPLE_BACKGROUND,
        d:
          'M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-5 17l1.006-4.036 3.106 3.105-4.112.931zm5.16-1.879l-3.202-3.202 5.841-5.919 3.201 3.2-5.84 5.921z',
      },
    ];

    const defs = svg
      .append('pattern')
      .attr('id', (d: any) => d.id)
      .attr('width', 1)
      .attr('height', 1)
      .append('svg:image')
      .attr('xlink:href', (d: any) => d.url)
      .attr('width', radius)
      .attr('height', radius);
    */
};

const click = () => console.log('click');

class D3Timeline {
  constructor(props: IProps) {
    const width = props.width - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    const maxDate = new Date();
    const minDate = subWeeks(maxDate, 1);
    const dataLinksValues = flatten(Object.values(props.dataLinks));

    const svg = select(props.selector);

    svg
      .attr('height', props.height)
      .attr('width', props.width)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    addIcons();

    const rows = ['  ', '  ', 'document', 'person', 'meeting'];

    // The x axis gets drawn many times
    svg.selectAll('.x.axis').remove();

    const xAxisSvg = svg
      .append('g')
      .attr('pointer-events', 'none')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`);

    // Add x axis
    const xScale = scaleTime([minDate, maxDate], [0, width]);
    const xAxis = (g: any, scale: any) => g.call(axisBottom(scale)).select('.domain').remove();
    xScale.domain(extent(props.data, (d) => d.time) as any);

    // Add y axis
    const yScale = scaleBand().domain(rows).range([0, height]).paddingInner(1);

    // set up the ancillary zooms and an accessor for their transforms
    const zoomX = zoom().scaleExtent([0.5, 10]);

    const tx = () => zoomTransform(xAxisSvg.node()!);
    xAxisSvg.call(zoomX as any);
    tx().rescaleX(xScale);

    const tooltip = select(props.tooltipRef.current);

    const handleHover = (event: any, d: ITimelineItem) => {
      const hoveredItem = d.id;
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(d.hoverText)
        .style('left', `${event.offsetX}px`)
        .style('top', `${event.offsetY - 28}px`);

      const links = props.dataLinks[hoveredItem];
      if (links) {
        svg.selectAll('.link').data(links as any);
      }
    };

    const nodes = props.data.map((data) => ({
      id: data.id,
      time: data.time,
      type: data.type,
      imageUrl: data.imageUrl,
      radius,
      stroke: colorHash[data.type],
      hoverText: data.hoverText,
    }));

    const updateNodes = () => {
      // update the nodes
      const u = select('svg g').selectAll('circle').data(nodes);

      // Enter any new nodes.
      const nodeElements = u
        .enter()
        .append('circle')
        .attr('class', (d) => d.type + ' node')
        .attr('r', (d) => d.radius)
        .style('stroke', (d: any) => d.stroke)
        .merge(u)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .style('fill', 'transparent')
        .on('mouseover', handleHover)
        .on('click', click);

      // add documents images
      nodeElements
        .append('image')
        .attr('xlink:href', (d) => d.imageUrl)
        .attr('x', -radius)
        .attr('y', -radius)
        .attr('height', radius * 2)
        .attr('width', radius * 2);

      u.exit().remove();
    };

    const updateXAxis = () => {
      // scale the x axis
      const xr = tx().rescaleX(xScale);
      xAxisSvg.call(xAxis, xr);
    };

    const updateLinks = () => {
      const u = select('.links')
        .selectAll('line')
        .data(nodes.length > 1 ? dataLinksValues : []);

      console.log(dataLinksValues, '<<<<<<');
      u.enter()
        .append('line')
        .merge(u)
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      u.exit().remove();
    };

    const ticked = () => {
      updateLinks();
      updateNodes();
      updateXAxis();
    };

    const simulation = forceSimulation(nodes as any)
      .force(
        'link',
        forceLink()
          .links(nodes.length > 1 ? dataLinksValues : [])
          .id((d) => d.id),
      )
      .force(
        'collision',
        forceCollide().radius((d: any) => d.radius),
      )
      .force(
        'x',
        forceX().x((d: any) => xScale(d.time)),
      )
      .force(
        'y',
        forceY().y((d: any) => yScale(d.type)!),
      )
      .on('tick', ticked);

    // Calculate the position before drawing
    // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
    for (
      let i = 0,
        n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
      i < n;
      ++i
    ) {
      simulation.tick();
    }
  }
}

export default D3Timeline;
