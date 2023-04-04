const http = require('http');
const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const jenkins = require('jenkins')({ baseUrl: 'http://user:pass@localhost:8080', crumbIssuer: true });

const appAuth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace literal '\n' with newline character
  installationId: process.env.GITHUB_INSTALLATION_ID,
});

const octokit = new Octokit({
  auth: appAuth,
});

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const event = req.headers['x-github-event'];
    const signature = req.headers['x-hub-signature-256'];
    const webhookConfig = {
      name: 'web',
      config: { url: req.url, content_type: 'json' },
    };
    const deliveryPayload = {
      event,
      signature,
      payload: Buffer.concat(chunks),
    };
    try {
      // Verify webhook signature
      await octokit.request('POST /app/hook/config', webhookConfig);
      const response = await octokit.request('POST /app/hook/deliveries', deliveryPayload);
      if (response.status === 204) {
        const payload = JSON.parse(deliveryPayload.payload.toString());
        if (event === 'push') {
          const { sha, ref } = payload.head_commit;
          if (ref.startsWith('refs/heads/')) {
            const branchName = ref.replace('refs/heads/', '');
            await jenkins.job.build({ name: 'my-job', parameters: { branch: branchName, commit: sha } });
          }
        }
        res.writeHead(204).end();
      } else {
        res.writeHead(500).end();
      }
    } catch (error) {
      console.error(error);
      res.writeHead(403).end();
    }
  } else {
    res.writeHead(404).end();
  }
}).listen(process.env.PORT);
