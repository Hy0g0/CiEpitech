const { Webhooks, createNodeMiddleware } = require("@octokit/webhooks");
const EventSource = require('eventsource')
const App = require("./git");

const owner = 'Hy0g0'; // Replace with the owner of the repository
const repo = 'CiEpitech'; // Replace with the name of the repository

async function main() {
gitApp = await App.Authentification();
}

main();

const secret = process.env.GITHUB_SECRET
const webhook = process.env.GITHUB_WEBHOOK

const webhooks = new Webhooks({
  secret: secret,
});

webhooks.onAny(({ id, name, payload }) => {
  console.log(name, "event received");
});

require("http").createServer(createNodeMiddleware(webhooks)).listen(3000);
// can now receive webhook events at /api/github/webhooks

const webhookProxyUrl = webhook; // 
const source =  new EventSource(webhookProxyUrl);
source.onmessage = (event) => {
  const webhookEvent = JSON.parse(event.data);
  webhooks
    .verifyAndReceive({
      id: webhookEvent["x-request-id"],
      name: webhookEvent["x-github-event"],
      signature: webhookEvent["x-hub-signature"],
      payload: webhookEvent.body,
    })
    .catch(console.error);
};