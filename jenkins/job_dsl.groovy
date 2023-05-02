      folder('Tools') {
        displayName('Tools')
        description('Folder for miscellaneous tools.')
      }

        job('/Tools/authentication'){
            scm {
                git{
                    remote {
                        url('https://github.com/Hy0g0/CiEpitech.git')
                        credentials('Jenkins_Agent')
                    }
                }
            }
        }

       freeStyleJob('/Tools/plan') {
           parameters {
                stringParam("GIT_BRANCH_NAME", "", "Github branch repository name")
           }
           steps {
                scm {
                    git{
                        remote {
                            url('https://github.com/Hy0g0/CiEpitech.git')
                            credentials('Jenkins_Agent')
                        }
                        branch('\$GIT_BRANCH_NAME')
                    }
                }
           }
           steps {
            shell("git checkout \$GIT_BRANCH_NAME")
            shell("docker run --name cilocal-localstack-1 -e LOCALSTACK_API_KEY=\${LOCALSTACK_API_KEY} -v \$(pwd)/AWS:/AWS localstack/localstack-pro tflocal -chdir=/AWS/ plan")
            shell("docker run -v \$(pwd)/AWS:/AWS hashicorp/terraform -chdir=/AWS/ apply -auto-approve")
           }
       }

       freeStyleJob('/Tools/apply') {
           parameters {
                stringParam("GIT_BRANCH_NAME", "", "Github branch repository name")
           }
            scm {
                steps {
                     git {
                         remote {
                             url('https://github.com/Hy0g0/CiEpitech.git')
                             credentials('Jenkins_Agent')
                         }
                         branch('\$GIT_BRANCH_NAME')
                     }
//                       shell("git checkout \$GIT_BRANCH_NAME")
                      shell("echo 'Done!'")
                }
                steps {
                            shell("git checkout \$GIT_BRANCH_NAME")
                            shell("docker run --name cilocal-localstack-1 -e LOCALSTACK_API_KEY=\${LOCALSTACK_API_KEY} -v \$(pwd)/AWS:/AWS localstack/localstack-pro tflocal -chdir=/AWS/ apply -auto-approve")
                           }
            }
            //TODO: Launch tflocal Apply in Docker container
       }