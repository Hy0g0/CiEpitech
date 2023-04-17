pipeline {
  agent any
  displayName 'my-job'
  parameters {
    string(name: 'branch', defaultValue: 'master', description: 'The branch to build')
    string(name: 'commit', defaultValue: '', description: 'The commit hash to build')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM', branches: [[name: "refs/heads/${params.branch}"]], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'github-creds', url: "https://https://github.com/Hy0g0/CiEpitech"]]])
        sh "git checkout ${params.commit}"
      }
    }

    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }

    stage('Deploy') {
      steps {
        sh 'npm install'
        sh 'npm run deploy'
      }
    }
  }
}
