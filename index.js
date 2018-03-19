const apiUrl = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
const tooltip = document.getElementsByClassName('tooltip')[0];

const plotData = (data) => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 100
  };
  const width = Math.max((((window.innerWidth / 100) * 80) - margin.right - margin.left), 700);
  const height = ((window.innerHeight / 100) * 80) - margin.bottom - margin.top;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const colors = ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'];
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleTime().range([0, height]);
  const baseTemp = data.baseTemperature;
  const monthlyVariance = data.monthlyVariance;
  const years = ((year) => year.filter((y, i) => year.indexOf(y) === i))(monthlyVariance.map(mv => mv.year));
  const variances = monthlyVariance.map(mv => mv.variance);
  const gridWidth = width / years.length;
  const gridHeight = height / months.length;
  const legendElementSize = 50;
  const minVariance = d3.min(variances);
  const maxVariance = d3.max(variances);
  const startYear = d3.min(years);
  const endYear = d3.max(years);
  const colorScale = d3.scaleQuantile()
    .domain([minVariance + baseTemp, maxVariance + baseTemp])
    .range(colors);
  x.domain([new Date(startYear, 0), new Date(endYear, 0)]);
  y.domain([new Date(0, 0, 1), new Date(0, 11, 31)]);

  const svg = d3.select('svg')
    .attr('width', width + margin.left + margin.right + 100)
    .attr('height', height + margin.top + margin.bottom + 100)
    .append('g')
    .attr('transform',
      `translate(${margin.left}, ${margin.top})`);

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform',
      `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(20).tickFormat(d3.timeFormat('%Y')));

  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).tickFormat(d3.timeFormat('%B')));

  svg.selectAll('.items')
    .data(monthlyVariance)
    .enter()
    .append('rect')
    .attr('x', d => (d.year - startYear) * gridWidth)
    .attr('y', d => (d.month - 1) * gridHeight)
    .attr('rx', 0)
    .attr('ry', 0)
    .attr('width', gridWidth)
    .attr('height', gridHeight)
    .style('fill', d => colorScale(d.variance + baseTemp))
    .on('mouseover', d => {
      tooltip.classList.remove('hidden');
      tooltip.innerHTML = `${months[d.month - 1]}, ${d.year}<br />Temp: ${(d.variance + baseTemp).toFixed(3)} &deg;C<br />Variance: ${d.variance} &deg;C`;
    })
    .on('mouseout', d => {
      tooltip.classList.add('hidden');
    })
    .exit();

  const legend = svg.selectAll('.legend')
    .data([0].concat(colorScale.quantiles()), (d) => d);

  const legend_g = legend.enter().append('g')
    .attr('class', 'legend');
  legend_g.append('rect')
    .attr('x', (d, i) => legendElementSize * i)
    .attr('y', height + 40)
    .attr('width', legendElementSize)
    .attr('height', 30)
    .style('fill', (d, i) => colors[i]);

  legend_g.append('text')
    .attr('class', 'mono')
    .text((d) => d.toFixed(2))
    .attr('x', (d, i) => legendElementSize * i)
    .attr('y', height + 80);

  legend.exit();

}

const dragstarted = d => {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

const dragged = d => {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

const dragended = d => {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

const plot = (data) => {
  data.nodes = data.nodes.map((d, index) => {
    d['id'] = index;
    return d;
  });
  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 100
  };
  const width = Math.max((((window.innerWidth / 100) * 80) - margin.right - margin.left), 700);
  const height = ((window.innerHeight / 100) * 80) - margin.bottom - margin.top;
  const svg = d3.select('svg')
    .attr('width', width + margin.left + margin.right + 100)
    .attr('height', height + margin.top + margin.bottom + 100)
    .append('g')
    .attr('transform',
      `translate(${margin.left}, ${margin.top})`);

  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function (d) { return d.id; }))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

  const dragstarted = d => {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  const dragged = d => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  const dragended = d => {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(data.links)
    .enter().append('line')
    .attr('stroke-width', function (d) { return Math.sqrt(d.value); });

  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(data.nodes)
    .enter().append('circle')
    .attr('r', 5)
    .attr('fill', '#eee')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  simulation
    .nodes(data.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(data.links);

  function ticked() {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
  }

}

const fetchData = () => {
  return fetch(apiUrl)
    .then(response => {
      return response.json();
    });
};

const fetchAndPlot = async () => {
  try {
    const response = await fetchData();
    console.log(response);
    plot(response);
  } catch (e) {
    console.error(e);
  }
}

fetchAndPlot();