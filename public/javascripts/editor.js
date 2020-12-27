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

const connectionlist = {
  Start: 'Start',
  End: 'End'
};
let cnt = 0;

function SaveProcess() {
  // Save data to server
  // POST: /saveprocess
}

let ans = [];
let ns = [];
function LoadAnsNs() {
  ans = [];
  ns = [];

  const donekeys = [];
  Object.keys(newdata).forEach(key => {
    if (newdata[key].anid && newdata[key].belongto_pid == pid) {
      ans.push(newdata[key]);
      donekeys.push(key);
    }
    if (newdata[key].nid && newdata[key].belongto_pid == pid) {
      ns.push(newdata[key]);
      donekeys.push(key);
    }
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
LoadAnsNs();

function UpdateTables() {
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
    content.append(cell);
    cell = document.createElement('td');
    const allout = an.out_ids.split(',');
    allout.forEach(ao => connectionlist[ao] = `Con${cnt++}`);
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
  
    networklist.append(content);
  });
}
UpdateTables();
