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
            shell("docker cp \$(pwd)/AWS/. 'ciepitech-localstack-1':/AWS")
            shell("docker exec 'ciepitech-localstack-1'  tflocal -chdir=/AWS/ plan")
           }
       }

       freeStyleJob('/Tools/apply') {
           steps {
               scm {
                   git{
                       remote {
                           url('https://github.com/Hy0g0/CiEpitech.git')
                           credentials('Jenkins_Agent')
                       }
                   }
               }
          }
          steps {
           shell("docker cp \$(pwd)/AWS/. 'ciepitech-localstack-1':/AWS")
           shell("docker exec 'ciepitech-localstack-1'  tflocal -chdir=/AWS/ apply -auto-approve")
          }
       }