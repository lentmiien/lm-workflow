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
  ['user_id', 'group_id'],
  ['pid', 'process', 'owner', 'manager', 'status', 'comment'],
  ['anid', 'belongto_pid', 'content_pid', 'content_aid', 'in_id', 'out_ids', 'processedby'],
  ['nid', 'belongto_pid', 'in_id', 'out_id'],
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

let needToLoadData = true;
const output = {};

exports.index = async (req, res) => {
  if (needToLoadData) {
    needToLoadData = false;
    
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
        structure[i].forEach(sl => {
          data[sheetName][index][sl] = row[sl];
        });
      });
    };

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
      output['groups'][rel.group_id].members.push(tmp_users[rel.user_id]);
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
    data['ActionNodes'].forEach(an => {
      if (tmp_actions[an.content_aid]) {
        output['processes'][an.belongto_pid].actionNodes.push({
          action: tmp_actions[an.content_aid],
          in_id: an.in_id,
          out_ids: an.out_ids,
          processedby: output['groups'][an.processedby].groupName
        });
      } else {
        output['processes'][an.belongto_pid].actionNodes.push({
          process: output['processes'][an.content_pid],
          pid: an.content_pid,
          in_id: an.in_id,
          out_ids: an.out_ids,
          processedby: output['processes'][an.content_pid].actionNodes[0].processedby
        });
      }
    });
    data['Network'].forEach(n => {
      output['processes'][n.belongto_pid].network.push({
        in_id: n.in_id,
        out_id: n.out_id
      });
    });
  }

  // Display output
  res.render('index', { output });
};