const users = JSON.parse(document.getElementById('users').innerHTML);
const groups = JSON.parse(document.getElementById('groups').innerHTML);
const updates = {};

async function SaveUpdates() {
  // Save data to server
  // POST: /saveprocess
  const response = await fetch('/saveprocess', {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const resp_data = await response.json();
  if (resp_data.status == 'OK') {
    window.open(`/update`, '_self');
  } else {
    alert(resp_data.status);
  }
}

function AddUGconnection(uid, gid) {
  if (uid.length == 0 || gid.length == 0) {
    return;
  }

  const thisID = (Date.now()).toString();
  updates[thisID] = {
    ugid: thisID,
    user_id: uid,
    group_id: gid
  };
  document.getElementById(uid).innerHTML += `<div>${groups[gid].name}</div>`;
  document.getElementById(gid).innerHTML += `<div>${users[uid].name}</div>`;
}

function AddNewUser() {
  const username = document.getElementById('uname').value;
  document.getElementById('uname').value = '';
  const thisID = (Date.now()).toString();
  
  // Add to updates
  updates[thisID] = {
    uid: thisID,
    name: username
  };

  // Add to user list
  users[thisID] = {
    uid: thisID,
    name: username
  }

  // Generate group options
  let all_group_options = '';
  Object.keys(groups).forEach(key => {
    all_group_options += `<option value="${key}">${groups[key].name}</option>`;
  });

  // Add to existing selects
  const selects = document.getElementsByClassName('group');
  for (let i = 0; i < selects.length; i++) {
    selects[i].innerHTML += `<option value="${thisID}">${username}</option>`;
  }

  // update HTML
  document.getElementById('utbody').innerHTML += `<tr>
  <td><div class="new">${username}</div></td>
  <td>
    <div id="${thisID}" class="new"></div>
    <div>
      <select class="form-control user" onchange="AddUGconnection('${thisID}',this.value)">
        <option value="">Add to group</option>
        ${all_group_options}
      </select>
    </div>
  </td>
</tr>`;
}

function AddNewGroup() {
  const groupname = document.getElementById('gname').value;
  document.getElementById('gname').value = '';
  const thisID = (Date.now()).toString();
  
  // Add to updates
  updates[thisID] = {
    gid: thisID,
    name: groupname
  };

  // Add to user list
  groups[thisID] = {
    gid: thisID,
    name: groupname
  }

  // Generate group options
  let all_user_options = '';
  Object.keys(users).forEach(key => {
    all_user_options += `<option value="${key}">${users[key].name}</option>`;
  });

  // Add to existing selects
  const selects = document.getElementsByClassName('user');
  for (let i = 0; i < selects.length; i++) {
    selects[i].innerHTML += `<option value="${thisID}">${groupname}</option>`;
  }

  // update HTML
  document.getElementById('gtbody').innerHTML += `<tr>
  <td><div class="new">${groupname}</div></td>
  <td>
    <div id="${thisID}" class="new"></div>
    <div>
      <select class="form-control group" onchange="AddUGconnection(this.value,'${thisID}')">
        <option value="">Add user</option>
        ${all_user_options}
      </select>
    </div>
  </td>
</tr>`;
}

function DeleteUGID(ugid_to_remove) {
  const delelements = document.getElementsByClassName(ugid_to_remove);
  while (delelements.length > 0) {
    delelements[0].setAttribute('class', 'delete');
  }

  if (!updates[ugid_to_remove]) {
    updates[ugid_to_remove] = {
      ugid: ugid_to_remove,
      user_id: '0',
      group_id: '0'
    }
  }
}
