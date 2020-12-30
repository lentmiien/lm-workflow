const rawdata = JSON.parse(document.getElementById('data').innerHTML);
const pid = document.getElementById('pid').innerText;
const actionnodelist = document.getElementById('actionnodelist');
const networklist = document.getElementById('networklist');
const newdata = {};

// If new
if (!rawdata[pid]) {
  newdata[pid] = {
    "pid": pid,
    "process": "",
    "owner": "",
    "manager": "",
    "status": "develop",
    "comment": ""
  };
}
function Aquire(id) {
  if (newdata[id]) {
    return newdata[id];
  } else {
    return rawdata[id];
  }
}

let connectionlist = {}
let cnt = 0;
let in_ids = [];
let out_ids = [];

function SaveProcess() {
  // Save data to server
  // POST: /saveprocess
}

let gs = [];
Object.keys(rawdata).forEach(key => {
  if (rawdata[key].gid) {
    gs.push(rawdata[key]);
  }
});

let ans = [];
let ns = [];
function LoadAnsNs() {
  ans = [];
  ns = [];

  const donekeys = [];
  Object.keys(newdata).forEach(key => {
    if (newdata[key].anid && newdata[key].belongto_pid == pid) {
      ans.push(newdata[key]);
    }
    if (newdata[key].nid && newdata[key].belongto_pid == pid) {
      ns.push(newdata[key]);
    }
    donekeys.push(key);
  });
  Object.keys(rawdata).forEach(key => {
    if (donekeys.indexOf(key) == -1) {
      if (rawdata[key].anid && rawdata[key].belongto_pid == pid) {
        ans.push(rawdata[key]);
      }
      if (rawdata[key].nid && rawdata[key].belongto_pid == pid) {
        ns.push(rawdata[key]);
      }
    }
  });
  ans.sort((a, b) => {
    if (a.order < b.order) {
      return -1;
    } else if (a.order > b.order) {
      return 1;
    } else {
      return 0;
    }
  });
  ns.sort((a, b) => {
    if (a.order < b.order) {
      return -1;
    } else if (a.order > b.order) {
      return 1;
    } else {
      return 0;
    }
  });
}

function UpdateTables() {
  LoadAnsNs();

  connectionlist = {
    Start: 'Start',
    End: 'End'
  };
  cnt = 0;
  in_ids = [];
  out_ids = [];

  actionnodelist.innerHTML = '';
  ans.forEach((an, i) => {
    const header = document.createElement('tr');
    let cell = document.createElement('th');
    cell.setAttribute('colspan', '3');
    cell.innerText = `Action node #${i}`;
    header.append(cell);
    const subheader = document.createElement('tr');
    cell = document.createElement('th');
    cell.innerText = 'Input';
    subheader.append(cell);
    cell = document.createElement('th');
    cell.innerText = Aquire(an.content_aid) ? 'Action' : 'Process';
    subheader.append(cell);
    cell = document.createElement('th');
    cell.innerText = 'Output';
    subheader.append(cell);
  
    // Content
    const content = document.createElement('tr');
    cell = document.createElement('td');
    connectionlist[an.in_id] = `Con${cnt++}`;
    in_ids.push(an.in_id);
    cell.innerHTML = `<ul><li>${connectionlist[an.in_id]}</li></ul>`;
    content.append(cell);
    cell = document.createElement('td');
    if (Aquire(an.content_aid)) {
      // Prepare tasks
      const tasks = Aquire(an.content_aid).content_tids.split(',');
      for (let t_i = 0; t_i < tasks.length; t_i++) {
        tasks[t_i] = Aquire(tasks[t_i]).task;
      }
      cell.innerHTML = `<div class="listaction"><b>${Aquire(an.content_aid).action}</b><ol><li>${tasks.join('</li><li>')}</li></ol></div>`;
    } else {
      cell.innerHTML = `<div class="listaction"><b>${Aquire(an.content_pid).process}</b></div>`;
    }
    // Processed by
    const pbselect = document.createElement('select');
    pbselect.setAttribute('id', 'pbselect');
    pbselect.setAttribute('class', 'form-control');
    pbselect.setAttribute('onchange', `UpdateProcessedBy(${an.anid},this.value)`);
    gs.forEach(g => {
      const pboption = document.createElement('option');
      pboption.setAttribute('value', g.gid);
      pboption.innerText = g.name;
      if (g.gid == an.processedby) {
        pboption.selected = true;
      }
      pbselect.append(pboption);
    });
    cell.append(pbselect);
    // Delete / Move up/down buttons
    const btndiv = document.createElement('div');
    const delbtn = document.createElement('button');
    delbtn.setAttribute('class', 'btn btn-danger');
    delbtn.setAttribute('onclick', `DeleteAN("${an.anid}")`);
    delbtn.innerText = 'Delete';
    const upbtn = document.createElement('button');
    upbtn.setAttribute('class', 'btn btn-primary');
    upbtn.setAttribute('onclick', `MoveUpAN("${an.anid}")`);
    upbtn.innerText = 'Up';
    const downbtn = document.createElement('button');
    downbtn.setAttribute('class', 'btn btn-primary');
    downbtn.setAttribute('onclick', `MoveDownAN("${an.anid}")`);
    downbtn.innerText = 'Down';
    btndiv.append(delbtn);
    btndiv.append(upbtn);
    btndiv.append(downbtn);
    cell.append(btndiv);
    content.append(cell);
    cell = document.createElement('td');
    const allout = an.out_ids.split(',');
    allout.forEach(ao => {
      connectionlist[ao] = `Con${cnt++}`;
      out_ids.push(ao);
    });
    const aol = [];
    if (allout.length > 1 && Aquire(an.content_aid)) {
      const alloutstr = Aquire(an.content_aid).outputs.split(',');
      alloutstr.forEach((aos, i) => {
        aol.push(`${connectionlist[allout[i]]}(${aos})`);
      });
    } else {
      allout.forEach(ao => aol.push(connectionlist[ao]));
    }
    cell.innerHTML = `<ul><li>${aol.join('</li><li>')}</li></ul>`;
    content.append(cell);
  
    const spacer = document.createElement('tr');
    cell = document.createElement('td');
    cell.setAttribute('colspan', '3');
    cell.style.height = '15px';
    cell.style.backgroundColor = 'black';
    spacer.append(cell);
  
    actionnodelist.append(header);
    actionnodelist.append(subheader);
    actionnodelist.append(content);
    actionnodelist.append(spacer);
  });
  
  networklist.innerHTML = '';
  ns.forEach((n, i) => {
    const content = document.createElement('tr');
    cell = document.createElement('td');
    cell.innerText = connectionlist[n.in_id];
    content.append(cell);
    cell = document.createElement('td');
    cell.innerText = ' ⇒ ';
    content.append(cell);
    cell = document.createElement('td');
    cell.innerText = connectionlist[n.out_id];
    content.append(cell);
    cell = document.createElement('td');
    const ndel = document.createElement('button');
    ndel.setAttribute('class', 'btn btn-danger');
    ndel.setAttribute('onclick', `DeleteN("${n.nid}")`);
    ndel.innerText = 'X';
    const nup = document.createElement('button');
    nup.setAttribute('class', 'btn btn-primary');
    nup.setAttribute('onclick', `MoveUpN("${n.nid}")`);
    nup.innerText = '↑';
    const ndown = document.createElement('button');
    ndown.setAttribute('class', 'btn btn-primary');
    ndown.setAttribute('onclick', `MoveDownN("${n.nid}")`);
    ndown.innerText = '↓';
    cell.append(nup);
    cell.append(ndown);
    cell.append(ndel);
    content.append(cell);
  
    networklist.append(content);
  });
  const inputrow = document.createElement('tr');
  cell = document.createElement('td');
  let select = document.createElement('select');
  select.setAttribute('id', 'startarrow');
  select.setAttribute('name', 'startarrow');
  select.setAttribute('class', 'form-control');
  select.innerHTML = '<option value="Start">Start</option>';
  out_ids.forEach(id => {
    const option = document.createElement('option');
    option.setAttribute('value', id);
    option.innerText = connectionlist[id];
    select.append(option);
  });
  cell.append(select);
  inputrow.append(cell);
  cell = document.createElement('td');
  let button = document.createElement('button');
  button.setAttribute('onclick', 'AddNetwork(document.getElementById("startarrow").value,document.getElementById("endarrow").value)');
  button.setAttribute('class', 'btn btn-primary');
  button.innerHTML = '⇒<br>Add';
  cell.append(button);
  inputrow.append(cell);
  cell = document.createElement('td');
  select = document.createElement('select');
  select.setAttribute('id', 'endarrow');
  select.setAttribute('name', 'endarrow');
  select.setAttribute('class', 'form-control');
  select.innerHTML = '<option value="End">End</option>';
  in_ids.forEach(id => {
    const option = document.createElement('option');
    option.setAttribute('value', id);
    option.innerText = connectionlist[id];
    select.append(option);
  });
  cell.append(select);
  inputrow.append(cell);
  cell = document.createElement('td');
  inputrow.append(cell);

  networklist.append(inputrow);
}
UpdateTables();

function AddActionNode(id) {
  const newID = Date.now();
  let outputs = (newID + 2).toString();
  if (Aquire(id).aid) {
    const outs = Aquire(id).outputs.split(',');
    for (let i = 1; i < outs.length; i++) {
      outputs += `,${newID + 2 + i}`;
    }
  }
  newdata[newID] = {
    anid: newID.toString(),
    order: ans.length,
    belongto_pid: pid,
    content_pid: Aquire(id).pid ? id : '0',
    content_aid: Aquire(id).aid ? id : '0',
    in_id: (newID + 1).toString(),
    out_ids: outputs,
    processedby: '1608296836280' //  "Oh-ami"
  };

  UpdateTables();
  DisplayWorkflow();
}

function AddNetwork(start, end) {
  const newID = Date.now();
  newdata[newID] = {
    nid: newID.toString(),
    order: ns.length,
    belongto_pid: pid,
    in_id: start,
    out_id: end
  };

  UpdateTables();
  DisplayWorkflow();
}

function UpdateProcessedBy(id, value) {
  if (newdata[id]) {
    newdata[id].processedby = value;
  } else {
    newdata[id] = {
      anid: id,
      order: rawdata[id].order,
      belongto_pid: rawdata[id].belongto_pid,
      content_pid: rawdata[id].content_pid,
      content_aid: rawdata[id].content_aid,
      in_id: rawdata[id].in_id,
      out_ids: rawdata[id].out_ids,
      processedby: value
    };
  }

  UpdateTables();
  DisplayWorkflow();
}

function DeleteAN(id) {
  if (newdata[id]) {
    newdata[id].belongto_pid = '0';
  } else {
    newdata[id] = {
      anid: id,
      order: rawdata[id].order,
      belongto_pid: '0',
      content_pid: rawdata[id].content_pid,
      content_aid: rawdata[id].content_aid,
      in_id: rawdata[id].in_id,
      out_ids: rawdata[id].out_ids,
      processedby: rawdata[id].processedby
    };
  }

  // Update order values correctly
  FixANOrderValues();

  // Remove any network that was connected to this node
  const ids = newdata[id].out_ids.split(',');
  ids.push(newdata[id].in_id);
  RemoveNetworkContainingIds(ids);

  UpdateTables();
  DisplayWorkflow();
}

function MoveUpAN(id) {
  const order_to_change = Aquire(id).order;
  if (order_to_change <= 0) {
    return;
  }

  ans.forEach(an => {
    if (an.order == order_to_change - 1) {
      // Move down (++)
      UpdateANOrder(an.anid, order_to_change);
    } else if (an.order == order_to_change) {
      // Move up (--)
      UpdateANOrder(an.anid, order_to_change - 1);
    }
  });

  UpdateTables();
  DisplayWorkflow();
}

function MoveDownAN(id) {
  const order_to_change = Aquire(id).order;
  if (order_to_change >= ans.length - 1) {
    return;
  }
  
  ans.forEach(an => {
    if (an.order == order_to_change) {
      // Move down (++)
      UpdateANOrder(an.anid, order_to_change + 1);
    } else if (an.order == order_to_change + 1) {
      // Move up (--)
      UpdateANOrder(an.anid, order_to_change);
    }
  });

  UpdateTables();
  DisplayWorkflow();
}

function FixANOrderValues() {
  // ans
  let i = 0;
  ans.forEach(an => {
    if (Aquire(an.anid).belongto_pid == pid) {
      if (an.order != i) {
        UpdateANOrder(an.anid, i);
      }
      i++;
    }
  });
}

function UpdateANOrder(id, value) {
  if (newdata[id]) {
    newdata[id].order = value;
  } else {
    newdata[id] = {
      anid: id,
      order: value,
      belongto_pid: rawdata[id].belongto_pid,
      content_pid: rawdata[id].content_pid,
      content_aid: rawdata[id].content_aid,
      in_id: rawdata[id].in_id,
      out_ids: rawdata[id].out_ids,
      processedby: rawdata[id].processedby
    };
  }
}

function RemoveNetworkContainingIds(ids) {
  ns.forEach(n => {
    if (ids.indexOf(n.in_id) >= 0 || ids.indexOf(n.out_id) >= 0) {
      RemoveNetwork(n.nid);
    }
  });
  // Update order values correctly
  FixNOrderValues();
}

function RemoveNetwork(id) {
  if (newdata[id]) {
    newdata[id].belongto_pid = '0';
  } else {
    newdata[id] = {
      nid: id,
      order: rawdata[id].order,
      belongto_pid: '0',
      in_id: rawdata[id].in_id,
      out_id: rawdata[id].out_id
    };
  }
}

function FixNOrderValues() {
  // ns
  let i = 0;
  ns.forEach(n => {
    if (Aquire(n.nid).belongto_pid == pid) {
      if (n.order != i) {
        UpdateNOrder(n.nid, i);
      }
      i++;
    }
  });
}

function UpdateNOrder(id, value) {
  if (newdata[id]) {
    newdata[id].order = value;
  } else {
    newdata[id] = {
      nid: id,
      order: value,
      belongto_pid: rawdata[id].belongto_pid,
      in_id: rawdata[id].in_id,
      out_id: rawdata[id].out_id
    };
  }
}

function DeleteN(id) {
  if (newdata[id]) {
    newdata[id].belongto_pid = '0';
  } else {
    newdata[id] = {
      nid: id,
      order: rawdata[id].order,
      belongto_pid: '0',
      in_id: rawdata[id].in_id,
      out_id: rawdata[id].out_id
    };
  }

  // Update order values correctly
  FixNOrderValues();

  UpdateTables();
  DisplayWorkflow();
}

function MoveUpN(id) {
  const order_to_change = Aquire(id).order;
  if (order_to_change <= 0) {
    return;
  }

  ns.forEach(n => {
    if (n.order == order_to_change - 1) {
      // Move down (++)
      UpdateNOrder(n.nid, order_to_change);
    } else if (n.order == order_to_change) {
      // Move up (--)
      UpdateNOrder(n.nid, order_to_change - 1);
    }
  });

  UpdateTables();
  DisplayWorkflow();

  console.log(ns);
}

function MoveDownN(id) {
  const order_to_change = Aquire(id).order;
  if (order_to_change >= ans.length - 1) {
    return;
  }
  
  ns.forEach(n => {
    if (n.order == order_to_change) {
      // Move down (++)
      UpdateNOrder(n.nid, order_to_change + 1);
    } else if (n.order == order_to_change + 1) {
      // Move up (--)
      UpdateNOrder(n.nid, order_to_change);
    }
  });

  UpdateTables();
  DisplayWorkflow();

  console.log(ns);
}

function EditProcess(id, value, field) {
  if (newdata[id]) {
    newdata[id][field] = value;
  } else {
    newdata[id] = {
      pid: id,
      process: rawdata[id].process,
      owner: rawdata[id].owner,
      manager: rawdata[id].manager,
      status: rawdata[id].status,
      comment: rawdata[id].comment
    };
    newdata[id][field] = value;
  }
}
