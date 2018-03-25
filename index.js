const apiUrl = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
const tooltip = document.getElementsByClassName('tooltip')[0];
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
    .force('link', d3.forceLink().id(function (d) { return d.id; }).distance(100).strength(1))
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

  const ticked = () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("x", function (d) { return d.x = Math.max(5, Math.min(width - 5, d.x)); })
      .attr("y", function (d) { return d.y = Math.max(5, Math.min(height - 5, d.y)); });
  }

  const link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(data.links)
    .enter().append('line')
    .attr('stroke-width', function (d) { return Math.sqrt(d.value); });

  const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('.flag')
    .data(data.nodes)
    .enter()
    .append('foreignObject')
    .attr('width', 10)
    .attr('height', 10)
    .append('div')
    .attr('class', d => `flag img-thumbnail flag flag-icon-background flag-icon-cz`)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  node.append("title")
    .text(function (d) { return d.country; })
    .exit();

  simulation
    .nodes(data.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(data.links);

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