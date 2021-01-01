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

async function SaveProcess() {
  // Save data to server
  // POST: /saveprocess
  const response = await fetch('/saveprocess', {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newdata)
  });
  const resp_data = await response.json();
  if (resp_data.status == 'OK') {
    window.open(`/update?pid=${pid}`, '_self');
  } else {
    alert(resp_data.status);
  }
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
      for (let t_i = 0; t_i < tasks.length && tasks[0].length > 0; t_i++) {
        tasks[t_i] = Aquire(tasks[t_i]).task + ` <button class="btn btn-danger" onclick="RemoveTaskFromAction('${an.content_aid}',${t_i})">X</button>`;
      }
      tasks.push(`<button class="btn btn-warning" onclick="TaskPopup('${an.content_aid}')">Add</button>`);
      cell.innerHTML = `<div class="listaction"><input class="form-control" value="${Aquire(an.content_aid).action}" onchange="EditAction('${an.content_aid}',this.value,'action')"><ol><li>${tasks.join('</li><li>')}</li></ol>*Changes above will affect all processes</div>`;
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
  let thisid = id;
  const newID = Date.now();
  let outputs = (newID + 2).toString();
  if (id == '0') {
    // Generate a new action
    const aid = (newID + 3).toString();
    thisid = aid;
    newdata[aid] = {
      aid: aid,
      action: "New action",
      content_tids: "",
      outputs: "OK"
    };
  } else if (Aquire(id).aid) {
    const outs = Aquire(id).outputs.split(',');
    for (let i = 1; i < outs.length; i++) {
      outputs += `,${newID + 2 + i}`;
    }
  }
  newdata[newID.toString()] = {
    anid: newID.toString(),
    order: ans.length,
    belongto_pid: pid,
    content_pid: Aquire(thisid).pid ? thisid : '0',
    content_aid: Aquire(thisid).aid ? thisid : '0',
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
}

function EditProcess(id, value, field) {
  if (!newdata[id]) {
    newdata[id] = {
      pid: id,
      process: rawdata[id].process,
      owner: rawdata[id].owner,
      manager: rawdata[id].manager,
      status: rawdata[id].status,
      comment: rawdata[id].comment
    };
  }
  newdata[id][field] = value;
}

function EditAction(id, value, field) {
  if (!newdata[id]) {
    newdata[id] = {
      aid: id,
      action: rawdata[id].action,
      content_tids: rawdata[id].content_tids,
      outputs: rawdata[id].outputs
    };
  }
  newdata[id][field] = value;

  UpdateTables();
  DisplayWorkflow();
}

function RemoveTaskFromAction(aid, t_index) {
  const tids = Aquire(aid).content_tids.split(',');
  tids.splice(t_index, 1);
  EditAction(aid, tids.join(','), 'content_tids');

  // Check all tasks and update outputs if necessary
  const outputs = ['OK'];
  tids.forEach(t => {
    const outarray = Aquire(t).outputs.split(',');
    outarray.forEach(oa => {
      if (outputs.indexOf(oa) == -1) {
        outputs.push(oa);
      }
    });
  });
  EditAction(aid, outputs.join(','), 'outputs');

  // Check all action nodes using the action and update output ids if neccessary
  const del_connections = [];
  Object.keys(newdata).forEach(key => {
    if (newdata[key].anid && newdata[key].content_aid == aid) {
      const out_ids = newdata[key].out_ids.split(',');
      while (outputs.length < out_ids.length) {
        del_connections.push(out_ids.pop());
      }
      EditActionNode(newdata[key].anid, out_ids.join(','), 'out_ids');
    }
  });
  Object.keys(rawdata).forEach(key => {
    if (!newdata[key] && rawdata[key].anid && rawdata[key].content_aid == aid) {
      const out_ids = rawdata[key].out_ids.split(',');
      while (outputs.length < out_ids.length) {
        del_connections.push(out_ids.pop());
      }
      EditActionNode(rawdata[key].anid, out_ids.join(','), 'out_ids');
    }
  });

  // If any outputs were removed, remove associated networks
  del_connections.forEach(dc => {
    Object.keys(newdata).forEach(key => {
      if (newdata[key].nid && (newdata[key].in_id == dc || newdata[key].out_id == dc)) {
        EditNetwork(newdata[key].nid, '0', 'belongto_pid');
      }
    });
    Object.keys(rawdata).forEach(key => {
      if (!newdata[key] && rawdata[key].nid && (rawdata[key].in_id == dc || rawdata[key].out_id == dc)) {
        EditNetwork(rawdata[key].nid, '0', 'belongto_pid');
      }
    });
  });

  UpdateTables();
  DisplayWorkflow();
}

function TaskPopup(aid) {
  // Display a fullscreen popup where you can add one task to action (aid)
  const popup = document.createElement('div');
  popup.style.height = '100%';
  popup.style.width = '100%';
  popup.style.position = 'fixed';
  popup.style.zIndex = '1';
  popup.style.left = '0';
  popup.style.top = '0';
  popup.style.backgroundColor = 'rgb(0,0,0,0.9)';
  popup.id = 'popup';
  
  // Add buttons for tasks
  Object.keys(newdata).forEach(key => {
    if (newdata[key].tid) {
      const button = document.createElement('button');
      button.setAttribute('class', 'btn btn-secondary');
      button.style.margin = '2px';
      button.setAttribute('onclick', `AddExistingTaskToAction("${aid}","${newdata[key].tid}")`);
      button.innerText = newdata[key].task;
      popup.append(button);
    }
  });
  Object.keys(rawdata).forEach(key => {
    if (rawdata[key].tid) {
      const button = document.createElement('button');
      button.setAttribute('class', 'btn btn-secondary');
      button.style.margin = '2px';
      button.setAttribute('onclick', `AddExistingTaskToAction("${aid}","${rawdata[key].tid}")`);
      button.innerText = rawdata[key].task;
      popup.append(button);
    }
  });

  // Input text + button for creating a new task
  const new_hr = document.createElement('hr');
  const new_inputtitle = document.createElement('input');
  new_inputtitle.setAttribute('placeholder', 'Task title');
  new_inputtitle.id = 'inputtitle';
  new_inputtitle.style.width = '30%';
  const new_inputoutputs = document.createElement('input');
  new_inputoutputs.setAttribute('placeholder', 'Second output,Third output,...');
  new_inputoutputs.id = 'inputoutputs';
  const new_submitbutton = document.createElement('button');
  new_submitbutton.setAttribute('class', 'btn btn-secondary');
  new_submitbutton.innerText = 'Save & Add';
  new_submitbutton.setAttribute('onclick', `AddNewTaskToAction("${aid}")`);
  new_submitbutton.style.width = '30%';
  new_submitbutton.style.display = 'inline';
  popup.append(new_hr);
  popup.append(new_inputtitle);
  popup.append(new_inputoutputs);
  popup.append(new_submitbutton);

  // Cancel button
  const cancel_hr = document.createElement('hr');
  const cancel_button = document.createElement('button');
  cancel_button.setAttribute('class', 'btn btn-danger');
  cancel_button.style.margin = '2px';
  cancel_button.setAttribute('onclick', `ClosePopup()`);
  cancel_button.innerText = 'Cancel';
  popup.append(cancel_hr);
  popup.append(cancel_button);

  document.body.append(popup);
}

function AddExistingTaskToAction(aid, tid) {
  // Add task to task list
  const tasks = Aquire(aid).content_tids.split(',');
  if (Aquire(tasks[0])) {
    tasks.push(tid);
  } else {
    tasks[0] = tid;
  }
  EditAction(aid, tasks.join(','), 'content_tids');

  // Check all tasks and update outputs if necessary
  const outputs = ['OK'];
  tasks.forEach(t => {
    const outarray = Aquire(t).outputs.split(',');
    outarray.forEach(oa => {
      if (outputs.indexOf(oa) == -1) {
        outputs.push(oa);
      }
    });
  });
  EditAction(aid, outputs.join(','), 'outputs');

  // Check all action nodes using the action and update output ids if neccessary
  Object.keys(newdata).forEach(key => {
    if (newdata[key].anid && newdata[key].content_aid == aid) {
      const out_ids = newdata[key].out_ids.split(',');
      let start_id = Date.now();
      while (outputs.length > out_ids.length) {
        out_ids.push(start_id.toString());
        start_id++;
      }
      EditActionNode(newdata[key].anid, out_ids.join(','), 'out_ids');
    }
  });
  Object.keys(rawdata).forEach(key => {
    if (!newdata[key] && rawdata[key].anid && rawdata[key].content_aid == aid) {
      const out_ids = rawdata[key].out_ids.split(',');
      let start_id = Date.now();
      while (outputs.length > out_ids.length) {
        out_ids.push(start_id.toString());
        start_id++;
      }
      EditActionNode(rawdata[key].anid, out_ids.join(','), 'out_ids');
    }
  });

  // If any outputs were removed, remove associated networks
  // Does not occur when adding tasks

  // Hide popup
  ClosePopup();

  UpdateTables();
  DisplayWorkflow();
}

function EditTask(id, value, field) {
  if (!newdata[id]) {
    newdata[id] = {
      tid: id,
      task: rawdata[id].task,
      outputs: rawdata[id].outputs
    };
  }
  newdata[id][field] = value;
}

function EditActionNode(id, value, field) {
  if (!newdata[id]) {
    newdata[id] = {
      anid: rawdata[id].anid,
      order: rawdata[id].order,
      belongto_pid: rawdata[id].belongto_pid,
      content_pid: rawdata[id].content_pid,
      content_aid: rawdata[id].content_aid,
      in_id: rawdata[id].in_id,
      out_ids: rawdata[id].out_ids,
      processedby: rawdata[id].processedby
    };
  }
  newdata[id][field] = value;
}

function EditNetwork(id, value, field) {
  if (!newdata[id]) {
    newdata[id] = {
      nid: rawdata[id].nid,
      order: rawdata[id].order,
      belongto_pid: rawdata[id].belongto_pid,
      in_id: rawdata[id].in_id,
      out_id: rawdata[id].out_id
    };
  }
  newdata[id][field] = value;
}

function ClosePopup() {
  const element = document.getElementById('popup');
  element.parentNode.removeChild(element);
}

function AddNewTaskToAction(aid) {
  const title = document.getElementById('inputtitle').value;
  const outputs = document.getElementById('inputoutputs').value;

  const newID = Date.now();
  newdata[newID.toString()] = {
    tid: newID.toString(),
    task: title,
    outputs: 'OK' + (outputs.length > 0 ? ',' + outputs : '')
  }

  AddExistingTaskToAction(aid, newID.toString());

  ClosePopup();
}
