var jenkins = require("jenkins")

const jenurl = process.env.JENKINS_URL

const instance =  new jenkins({
  baseUrl: jenurl
});

async function main() {
var test = await instance.info()
console.log(test)
}

main();