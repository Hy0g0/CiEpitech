      folder('Tools') {
        displayName('Tools')
        description('Folder for miscellaneous tools.')
      }

      freeStyleJob('/Tools/plan') {
          parameters {
            stringParam("GIT_BRANCH_NAME", "", "Github branch repository name")
          }
          steps {
            shell("git clone https://github.com/Hy0g0/CiEpitech.git")
            shell("cd CiEpitech && git checkout \$GIT_BRANCH_NAME")
            shell("echo 'Done!'")
            //TODO: Add localstack plan command
          }
      }

      freeStyleJob('/Tools/apply') {
          steps {
            shell("git clone https://github.com/Hy0g0/CiEpitech.git /repo")
            shell("cd /repo/CiEpitech")
            shell("echo 'Done!'")
            //TODO: Add localstack apply command and more
          }
      }