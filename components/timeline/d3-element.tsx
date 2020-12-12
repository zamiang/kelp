import {
  Simulation,
  SimulationNodeDatum,
  axisBottom,
  drag,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  scaleBand,
  scaleTime,
  select,
} from 'd3';
import { addSeconds } from 'date-fns';
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
  source: INode;
  target: INode;
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

const radius = 10;
const margin = {
  top: 0,
  bottom: 20,
  left: 0,
  right: 0,
};
const simulationDurationSeconds = 3;

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
  forceEndTime: Date;

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

    this.forceEndTime = addSeconds(new Date(), simulationDurationSeconds);

    const svg = select(props.selector);

    svg
      .attr('height', props.height)
      .attr('width', props.width)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

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

    const boxingForce = () => {
      for (const node of this.nodes) {
        // Of the positions exceed the box, set them to the boundary position.
        // You may want to include your nodes width to not overlap with the box.
        (node as any).y = Math.max(radius, Math.min(this.height - radius, (node as any).y));
      }
    };

    this.simulation = forceSimulation(this.nodes as any)
      .force('charge', forceManyBody())
      .force('collide', forceCollide(radius))
      .force('bounds', boxingForce)
      .force(
        'x',
        forceX().x((d: any) => xScale(d.time)),
      )
      .force(
        'y',
        forceY().y((d: any) => yScale(d.type)!),
      )
      .alphaTarget(0.01)
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
    if (new Date() > this.forceEndTime) {
      return this.simulation.stop();
    }

    select('.nodes')
      .selectAll('.node')
      .data(this.nodes)
      .attr('transform', (d: any) => `translate(${Math.round(d.x)}, ${Math.round(d.y)})`);

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
      .attr('class', (d) => d.type + ' node')
      .on('mouseover', function (d) {
        d.radius = radius * 1.5;
        select(this).select('circle').transition().attr('r', d.radius);
      })
      .on('mouseout', function (d) {
        d.radius = radius;
        select(this).select('circle').transition().attr('r', d.radius);
      });

    // add circle
    u.append('circle')
      .attr('r', (d) => d.radius)
      .attr('clip-path', 'url(#circle)');

    // Append hero name on roll over next to the node as well
    u.append('text')
      .attr('class', 'nodetext')
      .attr('x', 0)
      .attr('y', radius * 3)
      .text(function (d) {
        return d.hoverText;
      });

    // Icon
    u.append('text')
      .attr('class', 'avatar')
      .attr('y', radius / 2)
      .text((d) => {
        if (!d.imageUrl) {
          return d.hoverText[0].toLocaleUpperCase();
        }
        return '';
      });

    // add documents images
    u.append('image')
      .attr('xlink:href', (d) => d.imageUrl)
      .attr('x', -radius)
      .attr('y', -radius)
      .attr('height', radius * 2)
      .attr('width', radius * 2)
      .attr('clip-path', 'url(#circle)');

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
      if (!event.active) simulation.alphaTarget(0.4).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      event.subject.radius = event.subject.radius * 2;

      this.updateLinksForNode(event.subject);
      this.forceEndTime = addSeconds(new Date(), simulationDurationSeconds);
    };

    const dragged = (event: any) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    };

    const dragended = (event: any) => {
      if (!event.active) simulation.alphaTarget(0.001).restart();
      event.subject.fx = null;
      event.subject.fy = null;
      event.subject.radius = radius;

      this.updateLinksForNode(null);
      this.forceEndTime = addSeconds(new Date(), simulationDurationSeconds);
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

    const currentNodeIds = this.nodes.map((node) => node.id);

    props.data.forEach((node) => {
      if (!currentNodeIds.includes(node.id)) {
        this.nodes.push({
          id: node.id,
          time: node.time,
          type: node.type,
          imageUrl: node.imageUrl,
          radius,
          hoverText: node.hoverText,
        });
      }
    });

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
    const u = select('.links').selectAll('line').data(this.dataLinks);

    u.exit().remove();

    u.enter()
      .append('line')
      .merge(u as any);

    this.simulation.nodes(this.nodes as any).on('tick', this.onTick.bind(this));

    // update the simulation
    this.simulation.force(
      'link',
      forceLink()
        .links(this.dataLinks as any)
        .distance(70),
    );
  }

  getLinksForNode(node: INode) {
    const linksData: IDataLink[] = [];
    const idToIndexHash: { [id: string]: INode } = {};
    this.nodes.map((d) => {
      idToIndexHash[d.id] = d;
    });

    if (node.type === 'person' && node.id && (node as any).index) {
      const person = this.personDataStore.getPersonById(node.id)!;
      const personSegments = person.segmentIds
        .map((segmentId) => this.timeDataStore.getSegmentById(segmentId))
        .filter((segment) => segment!.start > this.minDate);

      this.personDataStore
        .getAssociates(person.id, personSegments)
        .filter((associate) => !associate.self)
        .forEach((associate) => {
          const targetPerson = this.personDataStore.getPersonById(associate.personId);
          const targetIndex = targetPerson ? idToIndexHash[targetPerson.id] : null;
          if (targetIndex) {
            linksData.push({
              source: node,
              target: idToIndexHash[this.personDataStore.getPersonById(associate.personId)!.id],
            });
          }
        });

      uniqBy(
        Object.values(person.driveActivity).map((activity) =>
          this.documentsDataStore.getByLink(activity.link),
        ),
        'id',
      ).forEach((document) => {
        const documentIndex = document ? idToIndexHash[document.id] : null;
        if (documentIndex) {
          linksData.push({
            source: node,
            target: idToIndexHash[document!.id],
          });
        }
      });
    }
    return linksData;
  }
}

export default D3Timeline;
