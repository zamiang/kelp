import {
  Simulation,
  SimulationNodeDatum,
  axisBottom,
  drag,
  forceCollide,
  forceLink,
  forceSimulation,
  forceX,
  forceY,
  scaleBand,
  scaleTime,
  select,
} from 'd3';
import { subWeeks } from 'date-fns';
import { uniqBy } from 'lodash';
import { IStore } from '../store/use-store';

export interface ITimelineItem {
  id: string;
  time: Date;
  imageUrl: string;
  type: 'document' | 'person' | 'meeting';
  hoverText: string;
}

interface INode {
  id: string;
  time: Date;
  imageUrl: string;
  type: 'document' | 'person' | 'meeting';
  hoverText: string;
  radius: number;
}

interface IDataLink {
  source: number;
  target: number;
}

interface IProps {
  width: number;
  height: number;
  data: ITimelineItem[];
  dataLinks: IDataLink[];
  selector: any;
  documentsDataStore: IStore['documentDataStore'];
  personDataStore: IStore['personDataStore'];
  timeDataStore: IStore['timeDataStore'];
  maxDate: Date;
  minDate: Date;
}

const radius = 20;
const margin = {
  top: 0,
  bottom: 20,
  left: 0,
  right: 0,
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

class D3Timeline {
  nodes: INode[];
  dataLinks: IDataLink[];
  simulation: Simulation<SimulationNodeDatum, undefined>;
  rows = ['  ', '  ', 'document', 'person', 'meeting'];
  height: number;
  width: number;
  minDate: Date;
  maxDate: Date;
  documentsDataStore: IStore['documentDataStore'];
  personDataStore: IStore['personDataStore'];
  timeDataStore: IStore['timeDataStore'];

  constructor(props: IProps) {
    this.personDataStore = props.personDataStore;
    this.documentsDataStore = props.documentsDataStore;
    this.timeDataStore = props.timeDataStore;
    this.dataLinks = props.dataLinks;
    this.nodes = props.data.map((data) => ({
      id: data.id,
      time: data.time,
      type: data.type,
      imageUrl: data.imageUrl,
      radius,
      hoverText: data.hoverText,
    }));

    this.width = props.width - margin.left - margin.right;
    this.height = props.height - margin.top - margin.bottom;

    this.maxDate = props.maxDate;
    this.minDate = props.minDate;

    const svg = select(props.selector);

    svg
      .attr('height', props.height)
      .attr('width', props.width)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    addIcons();

    // Add x axis
    const xScale = scaleTime([this.minDate, this.maxDate], [0, this.width]);
    svg
      .append('g')
      .attr('pointer-events', 'none')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.height})`)
      .call(axisBottom(xScale));

    // yScale function - needed despite no y axis being displayed
    const yScale = scaleBand().domain(this.rows).range([0, this.height]).paddingInner(1);

    this.simulation = forceSimulation(this.nodes as any)
      .force('link', forceLink().strength(20).links(this.dataLinks))
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
      .alphaTarget(1)
      .on('tick', this.onTick.bind(this));

    // Calculate the position before drawing
    // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick

    // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
    // https://bl.ocks.org/kenpenn/268878b410ddb1201277be3f0305d566
    // http://bl.ocks.org/eesur/be2abfb3155a38be4de4
    svg.call(this.setupDrag(this.simulation));
    this.updateNodes();
    this.updateLinks();
  }

  onTick() {
    select('.nodes')
      .selectAll('.node')
      .data(this.nodes)
      .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

    select('.links')
      .selectAll('line')
      .data(this.dataLinks)
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);
  }

  updateNodes() {
    // update the nodes
    const u = select('.nodes')
      .selectAll('.node')
      .data(this.nodes)
      .enter()
      .append('g')
      .attr('class', (d) => d.type + ' node');

    // add circle
    u.append('circle').attr('r', (d) => d.radius);

    // Append hero name on roll over next to the node as well
    u.append('text')
      .attr('class', 'nodetext')
      .attr('x', 20)
      .attr('y', 25 + 15)
      .attr('fill', '130C0E')
      .text(function (d) {
        return d.hoverText;
      });

    // add documents images
    u.append('image')
      .attr('xlink:href', (d) => d.imageUrl)
      .attr('x', -radius)
      .attr('y', -radius)
      .attr('height', radius * 2)
      .attr('width', radius * 2);

    u.exit().remove();
    u.selectAll('circle').exit().remove();
    u.selectAll('text').exit().remove();
    u.selectAll('image').exit().remove();
  }

  updateLinks() {
    const u = select('.links').selectAll('line').data(this.dataLinks);

    u.enter()
      .append('line')
      .merge(u as any)
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    u.exit().remove();
  }

  setupDrag(simulation: any) {
    const dragSubject = (event: any) => simulation.find(event.x, event.y);

    const dragstarted = (event: any) => {
      //if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      event.subject.radius = event.subject.radius * 2;

      this.updateLinksForNode(event.subject);
    };

    const dragged = (event: any) => {
      // this.simulation.alphaTarget(0.7).restart();
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    };

    const dragended = (event: any) => {
      // if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      event.subject.radius = radius;

      this.updateLinksForNode(null);
    };

    return drag()
      .subject(dragSubject)
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  updateNodesFromProps(props: {
    data: ITimelineItem[];
    documentsDataStore: IStore['documentDataStore'];
    personDataStore: IStore['personDataStore'];
    timeDataStore: IStore['timeDataStore'];
  }) {
    this.personDataStore = props.personDataStore;
    this.documentsDataStore = props.documentsDataStore;
    this.timeDataStore = props.timeDataStore;
    this.nodes = props.data.map((data) => ({
      id: data.id,
      time: data.time,
      type: data.type,
      imageUrl: data.imageUrl,
      radius,
      hoverText: data.hoverText,
    }));

    // redraw the nodes
    this.updateNodes();

    // update the simulation
    this.simulation.nodes(this.nodes as any);

    // do all the ticks
    for (
      let i = 0,
        n = Math.ceil(
          Math.log(this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay()),
        );
      i < n;
      ++i
    ) {
      this.simulation.tick();
    }
  }

  updateLinksForNode(node: INode | null) {
    // get new data
    this.dataLinks = node ? this.getLinksForNode(node) : [];

    // update the link elements
    this.updateLinks();

    // update the simulation
    this.simulation.force('link')!.links(this.dataLinks);
  }

  getLinksForNode(node: INode) {
    let linksData: IDataLink[] = [];

    const idToIndexHash: { [id: string]: number } = {};
    this.nodes.map((d, index) => {
      idToIndexHash[d.id] = index;
    });

    if (node.type === 'person' && node.id && (node as any).index) {
      const person = this.personDataStore.getPersonById(node.id)!;
      const personSegments = person.segmentIds
        .map((segmentId) => this.timeDataStore.getSegmentById(segmentId))
        .filter((segment) => segment!.start > this.minDate);

      linksData = linksData.concat(
        this.personDataStore
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
            this.documentsDataStore.getByLink(activity.link),
          ),
          'id',
        ).map((document) => ({
          source: currentElement.index!,
          target: idToIndexHash[document.id],
        })),
      );
    }
    return linksData;
  }
}

export default D3Timeline;
