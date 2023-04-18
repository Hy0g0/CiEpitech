const { Webhooks, createNodeMiddleware } = require("@octokit/webhooks");
const EventSource = require('eventsource')
const App = require("./git");
const Jenkins = require("./jenkins");
const { get } = require("https");

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

async function getPRnumber(branchName){
  return gitApp.rest.pulls.list({
    owner,
    repo,
    state: "open"
  }).then(({ data: pullRequests }) => {
    const pullRequest = pullRequests.find(pr => pr.head.ref === branchName);
    if (pullRequest) {
      console.log(`The pull request number for branch "${branchName}" is ${pullRequest.number}.`);
      return pullRequest.number
    } else {
      console.log(`No open pull requests found for branch "${branchName}".`);
      return null;
    }
  }).catch(error => {
    console.error(`Error occurred while fetching pull requests: ${error}`);
    return null;
  });
}

async function getBranchFromCommit(commitId){
  const commit = await gitApp.rest.git.getCommit({
    owner: owner,
    repo: repo,
    commit_sha: commitId,
  });

  // Get the branch that the commit is associated with
  const branch = await gitApp.rest.repos.getBranch({
    owner: owner,
    repo: repo,
    branch: commit.data.parents[0].url.split("/").pop(),
  });
}

async function pushOnBranch(webhookEvent){
    branch = webhookEvent.body.ref
    branch = branch.split('/')
    const number = await getPRnumber(branch[2])
    const plan = await jenkins.job.build({
        name: "Tools/plan",
        parameters: { GIT_BRANCH_NAME: branch[2] },
      });
    console.log(branch[2])
   
   console.log(number)
      // Example: post a comment on a pull request
      setTimeout(async ()=>{
        const { data } = await gitApp.rest.issues.createComment({
        owner: owner,
        repo: repo,
        issue_number: number,
        body: "plan: http://localhost:8080/job/Tools/job/plan/"+ plan+"/",
      })},5000);
}

async function pushOnMain(webhookEvent){
  const commitId = webhookEvent.body.commits[0].id
  number = await getBranchFromCommit(commitId)
  idJob = await jenkins.job.build("Tools/apply");
  setTimeout(async ()=>{
    const { data } = await gitApp.rest.issues.createComment({
    owner: owner,
    repo: repo,
    issue_number: number,
    body: "plan: http://localhost:8080/job/Tools/job/plan/"+ idJob+"/",
  })},5000);
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

