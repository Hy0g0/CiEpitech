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

async function getPRnumber(branchName) {
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

async function getBranchFromCommit(commitId) {
  console.log(commitId)
  const commit = await gitApp.rest.git.getCommit({
    owner: owner,
    repo: repo,
    commit_sha: commitId,
  });
  console.log(commit);
  // Get the branch that the commit is associated with
  const branch = await gitApp.rest.repos.getBranch({
    owner: owner,
    repo: repo,
    branch: commit.data.parents[0].url.split("/").pop(),
  });
  console.log(branch)
  return branch
}

function postComment(PR, job) {
  setTimeout(async () => {
    var buildL = await jenkins.job.get('Tools/' + job)
    buildL = buildL.lastBuild.url
    let num = buildL.split('/' + job + '/')
    const { data } = await gitApp.rest.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: PR,
      body: "plan: http://localhost:8080/job/Tools/job/" + job + "/" + num[1],
    })
    console.log("ended well!")
  }, 10000);
}

async function pushOnBranch(webhookEvent) {
  try {
    branch = webhookEvent.body.ref
    branch = branch.split('/')
    const number = await getPRnumber(branch[2])
    await jenkins.job.build({
      name: "Tools/plan",
      parameters: { GIT_BRANCH_NAME: branch[2] },
    });
    // Example: post a comment on a pull request
    postComment(number, "plan")

  } catch (error) {
    console.error(error);
  }
}

async function pushOnMain(webhookEvent) {
  const commitId = webhookEvent.body.commits[0].id
  number = await getBranchFromCommit(commitId)
  jenkins.job.build('Tools/apply');
  await jenkins.job.build("Tools/apply");
  postComment(number, "apply")
}


const webhookProxyUrl = webhook; // 
const source = new EventSource(webhookProxyUrl);
source.onmessage = async (event) => {
  const webhookEvent = JSON.parse(event.data);
  let commitarr = webhookEvent.body.commits[0].modified
  let terraform = await commitarr.forEach(function (commit) {
    arr = commit.split('/')
    console.log(arr[0])
    if (arr[0] === "AWS") return true
  });
  if (terraform) {
    if (webhookEvent.body.ref === "refs/heads/master") {
      console.log("push on master")
      await pushOnMain(webhookEvent)
    } else {
      console.log("push on a branch")
      //await pushOnBranch(webhookEvent)
    }
  }
}

