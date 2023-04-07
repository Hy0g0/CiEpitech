const { createAppAuth } = require("@octokit/auth-app");
const { Octokit, App } = require( "octokit");

// const owner = 'Hy0g0'; // Replace with the owner of the repository
// const repo = 'CiEpitech'; // Replace with the name of the repository

const token = process.env.GITHUB_PRIVATE_KEY
const appId = process.env.GITHUB_APP_ID
const installId = process.env.GITHUB_INSTALLATION_ID


const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: appId,
    privateKey: token,
    installationId: installId,
  },
});

async function main() {
const {
  data: { slug },
} = await octokit.rest.apps.getAuthenticated();
console.log("Hello, %s", slug);


}

main()