const { App, createNodeMiddleware } = require("@octokit/app");

// Your GitHub app's authentication details
const appId = "YOUR_APP_ID";
const privateKey = "YOUR_APP_PRIVATE_KEY";
const installationId = "YOUR_APP_INSTALLATION_ID";
const clientID = "YOUR_APP_CLIENT_ID";

const app = new App({
    appId: appId,
    privateKey: privateKey,
    oauth: {
      clientId: clientID,
      clientSecret: privateKey,
    },
    webhooks: {
      secret: "secret",
    },
  });
