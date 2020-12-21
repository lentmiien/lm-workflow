const data = JSON.parse(document.getElementById('wfdata').innerHTML);
const outelement = document.getElementById('workflow');
const svgelement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
outelement.append(svgelement);
let process_id = document.getElementById("workflow_select").value;

function ShowWorkflow() {
  process_id = document.getElementById("workflow_select").value;
  svgelement.innerHTML = ''; // Clear previous data
  DisplayWorkflow();
}

const lanewidth = 200;

function DisplayWorkflow() {
  const process = data.processes[process_id];
  const lanes = [];
  const actionheight = 100;
  const header = 50;
  const vspacing = 20;
  const hspacing = 20;
  const hlane = [];
  const vlane = [];
  process.actionNodes.forEach(an => {
    if (lanes.indexOf(an.processedby) == -1) {
      lanes.push(an.processedby);
    }
  });

  // Set output size
  const height = process.actionNodes.length * (actionheight + vspacing) + header;// TODO: May need adjustment
  svgelement.setAttributeNS(null, 'width', lanes.length * (lanewidth + hspacing));
  svgelement.setAttributeNS(null, 'height', height);

  // Defs
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttributeNS(null, 'id', 'arrowhead');
  marker.setAttributeNS(null, 'markerWidth', 7);
  marker.setAttributeNS(null, 'markerHeight', 7);
  marker.setAttributeNS(null, 'refX', 5);
  marker.setAttributeNS(null, 'refY', 3.5);
  marker.setAttributeNS(null, 'orient', 'auto');
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttributeNS(null, 'points', '0 0, 7 3.5, 0 7');
  marker.append(polygon);
  defs.append(marker);
  svgelement.append(defs);

  // Draw lanes
  const lanecolor = {
    '顧客': '#eeeeee'
  };
  for (let i = 0; i < lanes.length; i++) {
    const g_lane = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // Background
    const lanebackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    lanebackground.setAttributeNS(null, 'x', i * (lanewidth + hspacing));
    lanebackground.setAttributeNS(null, 'y', 0);
    lanebackground.setAttributeNS(null, 'width', lanewidth);
    lanebackground.setAttributeNS(null, 'height', height);
    lanebackground.setAttributeNS(null, 'fill', lanecolor[lanes[i]] ? lanecolor[lanes[i]] : '#ffffaa');
    g_lane.append(lanebackground);
    const vlanebackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    vlanebackground.setAttributeNS(null, 'x', i * (lanewidth + hspacing) + lanewidth);
    vlanebackground.setAttributeNS(null, 'y', 0);
    vlanebackground.setAttributeNS(null, 'width', hspacing);
    vlanebackground.setAttributeNS(null, 'height', height);
    vlanebackground.setAttributeNS(null, 'fill', '#eeeeee');
    g_lane.append(vlanebackground);
    // Title
    const lanebacktitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lanebacktitle.setAttributeNS(null, 'x', (i * (lanewidth + hspacing)) + (lanewidth / 2));
    lanebacktitle.setAttributeNS(null, 'y', 26);
    lanebacktitle.setAttributeNS(null, 'text-anchor', 'middle');
    lanebacktitle.setAttributeNS(null, 'font-size', 'larger');
    lanebacktitle.setAttributeNS(null, 'font-weight', '900');
    lanebacktitle.textContent = lanes[i];
    g_lane.append(lanebacktitle);

    svgelement.append(g_lane);
  }

  // Draw actions
  const iolist = {};
  process.actionNodes.forEach((an, cnt) => {
    const lanenumber = lanes.indexOf(an.processedby);

    const g_actionnode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // Background
    const actionnodebackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    actionnodebackground.setAttributeNS(null, 'x', lanenumber * (lanewidth + hspacing) + 5);
    actionnodebackground.setAttributeNS(null, 'y', cnt * (actionheight + vspacing) + header);
    actionnodebackground.setAttributeNS(null, 'rx', 10);
    actionnodebackground.setAttributeNS(null, 'ry', 10);
    actionnodebackground.setAttributeNS(null, 'width', lanewidth - 10);
    actionnodebackground.setAttributeNS(null, 'height', actionheight);
    actionnodebackground.setAttributeNS(null, 'fill', lanecolor[an.processedby] ? lanecolor[an.processedby] : 'orange');
    actionnodebackground.setAttributeNS(null, 'stroke', 'black');
    g_actionnode.append(actionnodebackground);
    // Title
    const actionnodebacktitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    actionnodebacktitle.setAttributeNS(null, 'x', (lanenumber * (lanewidth + hspacing)) + (lanewidth / 2));
    actionnodebacktitle.setAttributeNS(null, 'y', cnt * (actionheight + vspacing) + header + 20);
    actionnodebacktitle.setAttributeNS(null, 'text-anchor', 'middle');
    actionnodebacktitle.textContent = an.action.action;
    g_actionnode.append(actionnodebacktitle);
    // Tasks
    const actiontaskstext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    actiontaskstext.setAttributeNS(null, 'x', (lanenumber * (lanewidth + hspacing)) + (lanewidth / 2));
    actiontaskstext.setAttributeNS(null, 'y', cnt * (actionheight + vspacing) + header + 44);
    actiontaskstext.setAttributeNS(null, 'text-anchor', 'middle');
    actiontaskstext.textContent = `${an.action.content.length} tasks`;
    const actiontasksrect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    actiontasksrect.setAttributeNS(null, 'x', lanenumber * (lanewidth + hspacing) + 10);
    actiontasksrect.setAttributeNS(null, 'y', cnt * (actionheight + vspacing) + header + 26);
    actiontasksrect.setAttributeNS(null, 'width', lanewidth - 20);
    actiontasksrect.setAttributeNS(null, 'height', 24);
    actiontasksrect.setAttributeNS(null, 'fill', 'rgba(0,0,0,0.15)');
    actiontasksrect.setAttributeNS(null, 'stroke', 'black');
    let taskstring = '';
    an.action.content.forEach(task => {
      if (taskstring.length == 0) {
        taskstring += task.task;
      } else {
        taskstring += '|' + task.task;
      }
    });
    actiontasksrect.setAttributeNS(null, 'onmouseenter', `DisplayHover(${lanenumber * (lanewidth + hspacing) + (lanewidth / 2)},${cnt * (actionheight + vspacing) + header + 65},"${taskstring}")`);
    actiontasksrect.setAttributeNS(null, 'onmouseleave', `HideHover()`);
    g_actionnode.append(actiontaskstext);
    g_actionnode.append(actiontasksrect);
    // Inputs
    iolist[an.in_id] = {
      x: lanenumber * (lanewidth + hspacing) + (lanewidth / 2),
      y: cnt * (actionheight + vspacing) + header
    };
    let connectionNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    connectionNode.setAttributeNS(null, 'cx', lanenumber * (lanewidth + hspacing) + (lanewidth / 2));
    connectionNode.setAttributeNS(null, 'cy', cnt * (actionheight + vspacing) + header);
    connectionNode.setAttributeNS(null, 'r', 2);
    connectionNode.setAttributeNS(null, 'stroke', 'black');
    g_actionnode.append(connectionNode);
    // Outputs
    const outs = an.out_ids.split(',');
    const labels = outs.length > 1;
    outs.forEach((id, c) => {
      iolist[id] = {
        x: lanenumber * (lanewidth + hspacing) + (c + 1) * (lanewidth / (outs.length + 1)),
        y: cnt * (actionheight + vspacing) + header + actionheight
      };
      connectionNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      connectionNode.setAttributeNS(null, 'cx', lanenumber * (lanewidth + hspacing) + (c + 1) * (lanewidth / (outs.length + 1)));
      connectionNode.setAttributeNS(null, 'cy', cnt * (actionheight + vspacing) + header + actionheight);
      connectionNode.setAttributeNS(null, 'r', 2);
      connectionNode.setAttributeNS(null, 'stroke', 'black');
      g_actionnode.append(connectionNode);
      if (labels) {
        const textcontent = an.action.outputs.split(',');
        const outlabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        outlabel.setAttributeNS(null, 'x', lanenumber * (lanewidth + hspacing) + (c + 1) * (lanewidth / (outs.length + 1)));
        outlabel.setAttributeNS(null, 'y', cnt * (actionheight + vspacing) + header + actionheight - 10);
        outlabel.setAttributeNS(null, 'text-anchor', 'middle');
        outlabel.textContent = textcontent[c];
        g_actionnode.append(outlabel);
      }
    });

    svgelement.append(g_actionnode);
  });

  // Draw arrows
  process.network.forEach(nn => {
    if (nn.in_id == "Start") {
      let nnNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      nnNode.setAttributeNS(null, 'cx', iolist[nn.out_id].x);
      nnNode.setAttributeNS(null, 'cy', iolist[nn.out_id].y - 5);
      nnNode.setAttributeNS(null, 'r', 10);
      nnNode.setAttributeNS(null, 'fill', 'green');
      nnNode.setAttributeNS(null, 'stroke', 'green');
      svgelement.append(nnNode);
    } else if (nn.out_id == "End") {
      let nnNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      nnNode.setAttributeNS(null, 'cx', iolist[nn.in_id].x);
      nnNode.setAttributeNS(null, 'cy', iolist[nn.in_id].y + 5);
      nnNode.setAttributeNS(null, 'r', 10);
      nnNode.setAttributeNS(null, 'fill', 'red');
      nnNode.setAttributeNS(null, 'stroke', 'red');
      svgelement.append(nnNode);
    } else {
      if (iolist[nn.out_id].y - iolist[nn.in_id].y > 0 && iolist[nn.out_id].y - iolist[nn.in_id].y <= vspacing + 1) {
        // 3-segment line
        let midy = iolist[nn.in_id].y + 15;
        while (hlane.indexOf(midy) >= 0) { midy -= 5; }
        hlane.push(midy);

        // Segment #1
        let nnArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nnArrow.setAttributeNS(null, 'x1', iolist[nn.in_id].x);
        nnArrow.setAttributeNS(null, 'y1', iolist[nn.in_id].y);
        nnArrow.setAttributeNS(null, 'x2', iolist[nn.in_id].x);
        nnArrow.setAttributeNS(null, 'y2', midy);
        nnArrow.setAttributeNS(null, 'stroke', 'black');
        nnArrow.setAttributeNS(null, 'stroke-width', 1);
        svgelement.append(nnArrow);

        // Segment #2
        nnArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nnArrow.setAttributeNS(null, 'x1', iolist[nn.in_id].x);
        nnArrow.setAttributeNS(null, 'y1', midy);
        nnArrow.setAttributeNS(null, 'x2', iolist[nn.out_id].x);
        nnArrow.setAttributeNS(null, 'y2', midy);
        nnArrow.setAttributeNS(null, 'stroke', 'black');
        nnArrow.setAttributeNS(null, 'stroke-width', 1);
        svgelement.append(nnArrow);

        // Segment #3
        nnArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nnArrow.setAttributeNS(null, 'x1', iolist[nn.out_id].x);
        nnArrow.setAttributeNS(null, 'y1', midy);
        nnArrow.setAttributeNS(null, 'x2', iolist[nn.out_id].x);
        nnArrow.setAttributeNS(null, 'y2', iolist[nn.out_id].y);
        nnArrow.setAttributeNS(null, 'stroke', 'black');
        nnArrow.setAttributeNS(null, 'stroke-width', 1);
        nnArrow.setAttributeNS(null, 'marker-end', 'url(#arrowhead)');
        svgelement.append(nnArrow);
      } else {
        // 5-segment line
        let midy1 = iolist[nn.in_id].y + 15;
        while (hlane.indexOf(midy1) >= 0) { midy1 -= 5; }
        hlane.push(midy1);
        let midy2 = iolist[nn.out_id].y - 5;
        while (hlane.indexOf(midy2) >= 0) { midy2 -= 5; }
        hlane.push(midy2);
        let midx = Math.floor(iolist[nn.in_id].x / (lanewidth + hspacing)) * (lanewidth + hspacing) + lanewidth + 5;
        if (iolist[nn.in_id].x < iolist[nn.out_id].x + (lanewidth / 2)) {
          while (vlane.indexOf(midx) >= 0) { midx += 5; }
        } else {
          midx -= lanewidth + 10;
          while (vlane.indexOf(midx) >= 0) { midx -= 5; }
        }
        vlane.push(midx);

        // Dash if going back
        let dash = false;
        if (iolist[nn.in_id].y > iolist[nn.out_id].y) {
          dash = true;
        }

        // Segment #1
        let nnArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nnArrow.setAttributeNS(null, 'x1', iolist[nn.in_id].x);
        nnArrow.setAttributeNS(null, 'y1', iolist[nn.in_id].y);
        nnArrow.setAttributeNS(null, 'x2', iolist[nn.in_id].x);
        nnArrow.setAttributeNS(null, 'y2', midy1);
        nnArrow.setAttributeNS(null, 'stroke', 'black');
        nnArrow.setAttributeNS(null, 'stroke-width', 1);
        if (dash) nnArrow.setAttributeNS(null, 'stroke-dasharray', 2);
        svgelement.append(nnArrow);

        // Segment #2
        nnArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nnArrow.setAttributeNS(null, 'x1', iolist[nn.in_id].x);
        nnArrow.setAttributeNS(null, 'y1', midy1);
        nnArrow.setAttributeNS(null, 'x2', midx);
        nnArrow.setAttributeNS(null, 'y2', midy1);
        nnArrow.setAttributeNS(null, 'stroke', 'black');
        nnArrow.setAttributeNS(null, 'stroke-width', 1);
        if (dash) nnArrow.setAttributeNS(null, 'stroke-dasharray', 2);
        svgelement.append(nnArrow);

        // Segment #3
        nnArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nnArrow.setAttributeNS(null, 'x1', midx);
        nnArrow.setAttributeNS(null, 'y1', midy1);
        nnArrow.setAttributeNS(null, 'x2', midx);
        nnArrow.setAttributeNS(null, 'y2', midy2);
        nnArrow.setAttributeNS(null, 'stroke', 'black');
        nnArrow.setAttributeNS(null, 'stroke-width', 1);
        if (dash) nnArrow.setAttributeNS(null, 'stroke-dasharray', 2);
        svgelement.append(nnArrow);

        // Segment #4
        nnArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nnArrow.setAttributeNS(null, 'x1', midx);
        nnArrow.setAttributeNS(null, 'y1', midy2);
        nnArrow.setAttributeNS(null, 'x2', iolist[nn.out_id].x);
        nnArrow.setAttributeNS(null, 'y2', midy2);
        nnArrow.setAttributeNS(null, 'stroke', 'black');
        nnArrow.setAttributeNS(null, 'stroke-width', 1);
        if (dash) nnArrow.setAttributeNS(null, 'stroke-dasharray', 2);
        svgelement.append(nnArrow);

        // Segment #5
        nnArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nnArrow.setAttributeNS(null, 'x1', iolist[nn.out_id].x);
        nnArrow.setAttributeNS(null, 'y1', midy2);
        nnArrow.setAttributeNS(null, 'x2', iolist[nn.out_id].x);
        nnArrow.setAttributeNS(null, 'y2', iolist[nn.out_id].y);
        nnArrow.setAttributeNS(null, 'stroke', 'black');
        nnArrow.setAttributeNS(null, 'stroke-width', 1);
        nnArrow.setAttributeNS(null, 'marker-end', 'url(#arrowhead)');
        if (dash) nnArrow.setAttributeNS(null, 'stroke-dasharray', 2);
        svgelement.append(nnArrow);
      }
    }
  });
}

function DisplayHover(x, y, content) {
  const svgelement = document.getElementsByTagName('svg')[0];
  const ghover = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  ghover.setAttributeNS(null, 'id', 'Hover');

  const lines = content.split('|');

  const hoverrect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  hoverrect.setAttributeNS(null, 'x', x - (lanewidth / 2));
  hoverrect.setAttributeNS(null, 'y', y - 14);
  hoverrect.setAttributeNS(null, 'width', lanewidth);
  hoverrect.setAttributeNS(null, 'height', lines.length * 20);
  hoverrect.setAttributeNS(null, 'fill', 'white');
  hoverrect.setAttributeNS(null, 'stroke', 'black');

  const hovertext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  hovertext.setAttributeNS(null, 'x', x);
  hovertext.setAttributeNS(null, 'y', y);
  hovertext.setAttributeNS(null, 'text-anchor', 'middle');
  lines.forEach((line, rn) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan.setAttributeNS(null, 'x', x);
    tspan.setAttributeNS(null, 'y', y + rn * 20);
    tspan.setAttributeNS(null, 'text-anchor', 'middle');
    tspan.textContent = line;
    hovertext.append(tspan);
  });

  ghover.append(hoverrect)
  ghover.append(hovertext)
  svgelement.append(ghover);
}

function HideHover() {
  const element = document.getElementById('Hover');
  element.parentElement.removeChild(element);
}

/*
{
  "processName": "GCS課出社（鍵付）",
  "processOwner": "横山",
  "processManager": "横山",
  "processStatus": "実行中",
  "processComment": "社員の出社",
  "actionNodes": [
    {
      "action": {
        "action": "事務所に入る（鍵）",
        "content": [
          {
            "task": "鍵を開ける",
            "outputs": "OK"
          },
          {
            "task": "ドアを開ける",
            "outputs": "OK"
          },
          {
            "task": "事務所に入る",
            "outputs": "OK,ERROR"
          },
          {
            "task": "ドアを閉める",
            "outputs": "OK"
          }
        ],
        "outputs": "OK"
      },
      "in_id": "1608298953383",
      "out_ids": "1608298991245",
      "processedby": "GCS課社員"
    },
    ...other nodes...
  ],
  "network": [
    {
      "in_id": "Start",
      "out_id": "1608298953383"
    },
    {
      "in_id": "1608298991245",
      "out_id": "1608298959405"
    },
    {
      "in_id": "1608298997648",
      "out_id": "1608298967155"
    },
    {
      "in_id": "1608299004373",
      "out_id": "1608298959405"
    },
    {
      "in_id": "1608299029482",
      "out_id": "1608298973582"
    },
    {
      "in_id": "1608299038696",
      "out_id": "End"
    }
  ]
}
*/

///////// DEBUG /////////////

DisplayWorkflow();
