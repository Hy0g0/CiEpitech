var jenkins = require("jenkins")

const jenurl = process.env.JENKINS_URL

console.log(jenurl)
const instance =  new jenkins({
  baseUrl: jenurl
});

exports.Authentification = async function Authentification() {
var conn = await instance.info()
console.log(conn.description)
return instance
}