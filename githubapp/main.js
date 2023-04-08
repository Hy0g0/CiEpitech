const { createAppAuth } = require("@octokit/auth-app");
const { Octokit, App } = require( "octokit");

const owner = 'Hy0g0'; // Replace with the owner of the repository
const repo = 'CiEpitech'; // Replace with the name of the repository

const token = process.env.GITHUB_PRIVATE_KEY
const appId = process.env.GITHUB_APP_ID
const installId = process.env.GITHUB_INSTALLATION_ID

var lastPush = null

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: appId,
    privateKey: token,
    installationId: installId,
  },
});

async function Authentification(){
const {
  data: { slug },
} = await octokit.rest.apps.getAuthenticated();
console.log("Hello, %s", slug);
}

async function getBaseInfos(){
  var { data } = await octokit.rest.activity.listRepoEvents({
    owner,
    repo
  });

  lastPush = data.filter(event => event.type === "PushEvent").shift();
  console.log("Last push: %s", lastPush)
}

async function checkForPushEvent() {
  var { data } = await octokit.rest.activity.listRepoEvents({
    owner,
    repo
  });

  const pushEvent = data.filter(event => event.type === "PushEvent").shift();
  if (pushEvent.id !== lastPush.id) {
    console.log("New push detected: %s", pushEvent);
    lastPush = pushEvent
  } else {
    console.log("No new push was detected");
  }
}
Authentification()
getBaseInfos()
setInterval(async () => {
  await checkForPushEvent();
}, 10000); // Check every 10 seconds



