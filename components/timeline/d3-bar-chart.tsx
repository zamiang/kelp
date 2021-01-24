import { axisBottom, max, mean, min, scaleBand, scaleLinear, select, timeFormat } from 'd3';

export interface IBarChartItem {
  date: Date;
  type: 'document' | 'person' | 'meeting';
  rate: number;
}

interface IProps {
  width: number;
  height: number;
  data: IBarChartItem[];
  selector: any;
  maxDate: Date;
  minDate: Date;
  label: string;
  startGradient: string;
  endGradient: string;
  smallLabel: string;
}

const margin = {
  top: 60,
  bottom: 30,
  left: 20,
  right: 20,
};

class D3BarChart {
  height: number;
  width: number;
  minDate: Date;
  maxDate: Date;
  data: IBarChartItem[];

  constructor(props: IProps) {
    this.width = props.width - margin.left - margin.right;
    this.height = props.height - margin.top - margin.bottom;
    this.data = props.data;

    this.maxDate = props.maxDate;
    this.minDate = props.minDate;

    const svg = select(props.selector);

    svg.selectAll('*').remove();

    svg
      .attr('height', props.height)
      .attr('width', props.width + 20)
      .append('g');
    // .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add x axis
    const xScale = scaleBand().rangeRound([0, this.width]).padding(0.4);
    const yScale = scaleLinear().range([this.height, 0]);
    const maxValue = (max(this.data, (d) => d.rate) as number) + 20;
    let minValue = (min(this.data, (d) => d.rate) as number) - 20;
    if (minValue < 0) {
      minValue = 0;
    }
    xScale.domain(this.data.map((d) => d.date) as any);
    yScale.domain([minValue, maxValue]);

    const formatter = (date: Date) => (timeFormat as any)('%a')(date)[0];
    const xAxis = axisBottom(xScale).tickFormat(formatter as any);
    const backgroundGradientUrl = `background-gradient-${props.smallLabel}`;
    // background
    svg
      .append('rect')
      .attr('class', 'background')
      .attr('rx', '5px')
      .attr('ry', '5px')
      .attr('width', props.width + 20)
      .attr('fill', `url(#${backgroundGradientUrl})`)
      .attr('height', props.height);

    // Gradients
    svg
      .append('linearGradient')
      .attr('id', backgroundGradientUrl)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', props.height)
      .selectAll('stop')
      .data([
        { offset: '0%', color: props.startGradient },
        { offset: '100%', color: props.endGradient },
      ])
      .enter()
      .append('stop')
      .attr('offset', function (d) {
        return d.offset;
      })
      .attr('stop-color', function (d) {
        return d.color;
      });

    const svgBody = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    svgBody
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.height})`)
      .call(xAxis);

    svgBody
      .selectAll('rect')
      .data(props.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.date as any) as any)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d.rate))
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('height', (d) => this.height - yScale(d.rate));

    svgBody
      .append('g')
      .selectAll('line')
      .data([
        { y1: yScale(minValue), y2: yScale(minValue), x1: 0, x2: this.width },
        {
          y1: yScale((maxValue + minValue) / 2),
          y2: yScale((maxValue + minValue) / 2),
          x1: 0,
          x2: this.width,
        },
        { y1: yScale(maxValue), y2: yScale(maxValue), x1: 0, x2: this.width },
      ])
      .enter()
      .append('line')
      .attr('class', 'date-line')
      .attr('y1', function (d) {
        return d.y1;
      })
      .attr('y2', function (d) {
        return d.y2;
      })
      .attr('x1', function (d) {
        return d.x1;
      })
      .attr('x2', function (d) {
        return d.x2;
      });

    const dailyAvg = Math.round(
      mean(this.data, function (d) {
        return d.rate;
      }) || 0,
    );

    svgBody
      .append('g')
      .selectAll('text')
      .data([
        {
          text: Math.round(minValue),
          x: this.width,
          y: yScale(minValue) - 5,
          anchor: 'end',
          labelClass: 'label-small',
        },
        {
          text: Math.round(maxValue),
          x: this.width,
          y: yScale(maxValue) + 15,
          anchor: 'end',
          labelClass: 'label-small',
        },
        {
          text: `Daily Avg: ${dailyAvg}`,
          x: 50,
          y: yScale(maxValue) - 5,
          anchor: 'start',
          labelClass: 'label-small',
        },
        {
          text: props.label,
          x: 50,
          y: yScale(maxValue) - 25,
          anchor: 'start',
          labelClass: 'label-large',
        },
        {
          text: `${Math.round(this.data[0] ? this.data[0].rate : 0)} ${props.smallLabel}`,
          x: this.width,
          y: yScale(maxValue) - 25,
          anchor: 'end',
          labelClass: 'label-large',
        },
        {
          text: 'Today',
          x: this.width,
          y: yScale(maxValue) - 5,
          anchor: 'end',
          labelClass: 'label-small',
        },
      ])
      .enter()
      .append('text')
      .attr('class', function (d) {
        return d.labelClass;
      })
      .text((d) => d.text)
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y;
      })
      .attr('text-anchor', function (d) {
        return d.anchor;
      });
  }
}

export default D3BarChart;
