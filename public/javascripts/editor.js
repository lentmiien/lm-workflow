const editdata = JSON.parse(document.getElementById('editdata').innerHTML);
const rawdata = JSON.parse(document.getElementById('data').innerHTML);
const actionnodelist = document.getElementById('actionnodelist');
const networklist = document.getElementById('networklist');

const connectionlist = {
  Start: 'Start',
  End: 'End'
};
let cnt = 0;

function SaveProcess() {
  // Save data to server
  // POST: /saveprocess
}

// Get process
const ps = {};
rawdata[3].data.forEach(p => {
  ps[p.pid] = p;
});

// Get action
const as = {};
rawdata[6].data.forEach(a => {
  as[a.aid] = a;
});

// Get tasks
const ts = {};
rawdata[7].data.forEach(t => {
  ts[t.tid] = t;
});

editdata.ans.forEach((an, i) => {
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
  cell.innerText = as[an.content_aid] ? 'Action' : 'Process';
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
  if (as[an.content_aid]) {
    // Prepare tasks
    const tasks = as[an.content_aid].content_tids.split(',');
    for (let t_i = 0; t_i < tasks.length; t_i++) {
      tasks[t_i] = ts[tasks[t_i]].task;
    }
    cell.innerHTML = `<div class="listaction"><b>${as[an.content_aid].action}</b><ol><li>${tasks.join('</li><li>')}</li></ol></div>`;
  } else {
    cell.innerHTML = `<div class="listaction"><b>${ps[an.content_pid].process}</b></div>`;
  }
  content.append(cell);
  cell = document.createElement('td');
  const allout = an.out_ids.split(',');
  allout.forEach(ao => connectionlist[ao] = `Con${cnt++}`);
  const aol = [];
  if (allout.length > 1 && as[an.content_aid]) {
    const alloutstr = as[an.content_aid].outputs.split(',');
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

editdata.ns.forEach((n, i) => {
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
