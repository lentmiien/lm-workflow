const { GoogleSpreadsheet } = require('google-spreadsheet');

const creds = {
  type: process.env.GSHEET_TYPE,
  project_id: process.env.GSHEET_PROJECT_ID,
  private_key_id: process.env.GSHEET_PRIVATE_KEY_ID,
  private_key: process.env.GSHEET_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GSHEET_CLIENT_EMAIL,
  client_id: process.env.GSHEET_CLIENT_ID,
  auth_uri: process.env.GSHEET_AUTH_URI,
  token_uri: process.env.GSHEET_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GSHEET_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GSHEET_CLIENT_X509_CERT_URL,
};

const structure = [
  ['uid', 'name'],
  ['gid', 'name'],
  ['ugid', 'user_id', 'group_id'],
  ['pid', 'process', 'owner', 'manager', 'status', 'comment'],
  ['anid', 'order', 'belongto_pid', 'content_pid', 'content_aid', 'in_id', 'out_ids', 'processedby'],
  ['nid', 'order', 'belongto_pid', 'in_id', 'out_id'],
  ['aid', 'action', 'content_tids', 'outputs'],
  ['tid', 'task', 'outputs']
];
const sheetNames = [
  'Users',
  'Groups',
  'UrelG',
  'Processes',
  'ActionNodes',
  'Network',
  'Actions',
  'Tasks'
];

const rawdata = {};
const output = {};

exports.index = (req, res) => {
  // Update if no data
  if (Object.keys(rawdata).length == 0) {
    return res.redirect('/update');
  }

  // Display output
  res.render('index', { output });
};

exports.update = async (req, res) => {
  // Acquire data
  const doc = new GoogleSpreadsheet(process.env.GSHEET_DOC_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const data = {};
  let i = -1;
  for (const sheetName of sheetNames) {
    i++;
    const sheet = doc.sheetsByIndex[i];
    const rows_raw = await sheet.getRows();
    data[sheetName] = [];
    rows_raw.forEach((row, index) => {
      data[sheetName].push({});
      const thisID = row[structure[i][0]];
      rawdata[thisID] = {};
      structure[i].forEach(sl => {
        data[sheetName][index][sl] = row[sl];
        rawdata[thisID][sl] = row[sl];
      });
    });
  };

  // Change order: string to number
  Object.keys(rawdata).forEach(key => {
    if (rawdata[key].order) {
      rawdata[key].order = parseInt(rawdata[key].order);
    }
  });

  // Generate output
  //const output = {};

  output['groups'] = {};
  data['Groups'].forEach(group => {
    output['groups'][group.gid] = {
      groupName: group.name,
      members: []
    };
  });
  const tmp_users = {};
  data['Users'].forEach(user => {
    tmp_users[user.uid] = user.name;
  });
  data['UrelG'].forEach(rel => {
    if (tmp_users[rel.user_id]) {
      output['groups'][rel.group_id].members.push(tmp_users[rel.user_id]);
    }
  });

  output['processes'] = {};
  data['Processes'].forEach(process => {
    output['processes'][process.pid] = {
      processName: process.process,
      processOwner: tmp_users[process.owner],
      processManager: tmp_users[process.manager],
      processStatus: process.status,
      processComment: process.comment,
      actionNodes: [],
      network: []
    };
  });
  const tmp_tasks = {};
  data['Tasks'].forEach(task => {
    tmp_tasks[task.tid] = {
      task: task.task,
      outputs: task.outputs
    };
  });
  const tmp_actions = {};
  data['Actions'].forEach(action => {
    tmp_actions[action.aid] = {
      action: action.action,
      content: [],
      outputs: action.outputs
    };
    const tasks = action.content_tids.split(',');
    tasks.forEach(task => {
      tmp_actions[action.aid].content.push(tmp_tasks[task]);
    });
  });
  data['ActionNodes'].sort((a, b) => {
    if (parseInt(a.order) < parseInt(b.order)) {
      return -1;
    } else if (parseInt(a.order) > parseInt(b.order)) {
      return 1;
    } else {
      return 0;
    }
  });
  data['ActionNodes'].forEach(an => {
    if (tmp_actions[an.content_aid]) {
      if (an.belongto_pid != '0') {
        output['processes'][an.belongto_pid].actionNodes.push({
          action: tmp_actions[an.content_aid],
          in_id: an.in_id,
          out_ids: an.out_ids,
          processedby: output['groups'][an.processedby].groupName
        });
      }
    } else {
      if (an.belongto_pid != '0') {
        output['processes'][an.belongto_pid].actionNodes.push({
          process: output['processes'][an.content_pid],
          pid: an.content_pid,
          in_id: an.in_id,
          out_ids: an.out_ids,
          processedby: output['processes'][an.content_pid].actionNodes[0].processedby
        });
      }
    }
  });
  data['Network'].sort((a, b) => {
    if (parseInt(a.order) < parseInt(b.order)) {
      return -1;
    } else if (parseInt(a.order) > parseInt(b.order)) {
      return 1;
    } else {
      return 0;
    }
  });
  data['Network'].forEach(n => {
    if (n.belongto_pid != '0') {
      output['processes'][n.belongto_pid].network.push({
        in_id: n.in_id,
        out_id: n.out_id
      });
    }
  });

  if (req.query.pid) {
    res.redirect(`/processdetails?pid=${req.query.pid}`);
  } else {
    res.redirect('/');
  }
};

exports.processdetails = (req, res) => {
  res.render('details', { data: output, pid: req.query.pid });
};

exports.processeditor = (req, res) => {
  res.render('editor', { rawdata, pid: req.query.pid ? req.query.pid : Date.now() });
};

exports.saveprocess = async (req, res) => {
  // Update data
  const doc = new GoogleSpreadsheet(process.env.GSHEET_DOC_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  const processed_ids = [];
  let i = -1;
  for (const sheetName of sheetNames) {
    i++;
    const sheet = doc.sheetsByIndex[i];
    const rows_raw = await sheet.getRows();
    rows_raw.forEach(row => {
      const thisID = row[structure[i][0]];
      if (req.body[thisID]) {
        // Update
        structure[i].forEach(sl => {
          row[sl] = req.body[thisID][sl];
        });
        row.save();
        processed_ids.push(thisID);
      }
    });
  };

  // Add new data
  i = -1;
  for (const sheetName of sheetNames) {
    i++;
    const sheet = doc.sheetsByIndex[i];
    const savedata = [];
    Object.keys(req.body).forEach(key => {
      if (processed_ids.indexOf(key) == -1) {
        // Check if entry belongs to current sheet
        if (req.body[key][structure[i][0]]) {
          // Save a new entry (row)
          const sdata = {};
          structure[i].forEach(sl => {
            sdata[sl] = req.body[key][sl];
          });
          savedata.push(sdata)
          processed_ids.push(key);
        }
      }
    });
    if (savedata.length > 0) {
      sheet.addRows(savedata);
    }
  };

  res.json({ status: 'OK' });
};

exports.users = (req, res) => {
  const users = {};
  const groups = {};

  // Populate data
  Object.keys(rawdata).forEach(key => {
    if (rawdata[key].uid) {
      users[key] = rawdata[key];
      users[key]['groups'] = [];
      users[key]['ugids'] = [];
    }
    if (rawdata[key].gid) {
      groups[key] = rawdata[key];
      groups[key]['users'] = [];
      groups[key]['ugids'] = [];
    }
  });

  // Link data
  Object.keys(rawdata).forEach(key => {
    if (rawdata[key].ugid) {
      // user_id, group_id
      if (groups[rawdata[key].group_id] && users[rawdata[key].user_id]) {
        users[rawdata[key].user_id].groups.push(groups[rawdata[key].group_id].name);
        groups[rawdata[key].group_id].users.push(users[rawdata[key].user_id].name);
        users[rawdata[key].user_id].ugids.push(key);
        groups[rawdata[key].group_id].ugids.push(key);
      }
    }
  });

  res.render('users', { users, groups });
};
