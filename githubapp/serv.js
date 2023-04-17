const { Webhooks, createNodeMiddleware } = require("@octokit/webhooks");
const EventSource = require('eventsource')
const App = require("./git");
const Jenkins = require("./jenkins");

const owner = 'Hy0g0'; // Replace with the owner of the repository
const repo = 'CiEpitech'; // Replace with the name of the repository

var gitApp;
var jenkins;

async function Authentification() {
gitApp = await App.Authentification();
jenkins = await Jenkins.Authentification()
}

Authentification();

const secret = process.env.GITHUB_SECRET
const webhook = process.env.GITHUB_WEBHOOK

const webhooks = new Webhooks({
  secret: secret,
});

require("http").createServer(createNodeMiddleware(webhooks)).listen(3000);
// can now receive webhook events at /api/github/webhooks

async function pushOnBranch(webhookEvent){
    branch = webhookEvent.body.ref
    branch = branch.split('/')
    console.log(branch[2])
    await jenkins.job.build({
        name: "plan",
        parameters: { name: branch[2] },
      });
}

async function pushOnMain(webhookEvent){
    await jenkins.job.build("apply");
}

const webhookProxyUrl = webhook; // 
const source =  new EventSource(webhookProxyUrl);
source.onmessage = async (event) => {
  const webhookEvent = JSON.parse(event.data);
  if(webhookEvent.body.ref === "refs/heads/master"){
    console.log("push on master")
   await  pushOnMain(webhookEvent)
  }else{
    console.log("push on a branch")
    await pushOnBranch(webhookEvent)
  }
  
}

