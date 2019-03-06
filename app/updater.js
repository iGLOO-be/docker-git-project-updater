
const Boom = require('boom')
const fs = require('fs-extra')
const gitP = require('simple-git/promise')
const uidNumber = require('uid-number')
const chownr = require('chownr')

const projects = JSON.parse(process.env.PROJECTS || '[]')
const GIT_SSH_COMMAND_ARGS = process.env.GIT_SSH_COMMAND_ARGS || ''
const GIT_SSH_COMMAND = `ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no ${GIT_SSH_COMMAND_ARGS}`;
const repositoryOwner = process.env.FORCE_OWNER

const createOrUpdateProject = async ({ projectName, reference }) => {
  if (!projectName || !reference) {
    throw Boom.badRequest()
  }

  const project = projects.find((v) => v.name === projectName)
  if (!project) {
    throw Boom.notFound('Project not found')
  }

  const parameters = {
    projectPath: project.projectPath || project.path,
    reference,
    repo: project.repo
  }

  if (await fs.pathExists(parameters.projectPath)) {
    return updateProject(parameters)
  } else {
    return createProject(parameters)
  }
}

const createProject = async ({ projectPath, reference, repo }) => {
  const output = []
  const error = []
  return gitP()
    .outputHandler((command, stdout, stderr) => {
      console.log(new Date())
      stdout.pipe(process.stdout)
      output.push(`===> ${command}`)
      stdout.on('data', data => {
        output.push(data.toString('utf8'))
      })

      stderr.pipe(process.stderr)
      error.push(`===> ${command}`)
      stderr.on('data', data => {
        error.push(data.toString('utf8'))
      })
    })
    .env('GIT_SSH_COMMAND', GIT_SSH_COMMAND)
    .clone(repo, projectPath)
    .then(() => updateProject({ projectPath, reference, repo }, output))
    .catch((err) => {
      throw Boom.boomify(err, { decorate: { commandError: error, commandOutput: output }, statusCode: 400 });
    })
}

const updateProject = async ({ projectPath, reference }, _output = []) => {
  let git = gitP(projectPath)
  const isRepo = await git.checkIsRepo()

  if (!isRepo) {
    throw Boom.badRequest('Is not a git repository...')
  }

  const output = _output || []
  const error = []
  git = git
    .env('GIT_SSH_COMMAND', GIT_SSH_COMMAND)
    .outputHandler((command, stdout, stderr) => {
      console.log(new Date())
      stdout.pipe(process.stdout)
      output.push(`===> ${command}`)
      stdout.on('data', data => {
        output.push(data.toString('utf8'))
      })

      stderr.pipe(process.stderr)
      error.push(`===> ${command}`)
      stderr.on('data', data => {
        error.push(data.toString('utf8'))
      })
    })

  if (repositoryOwner) {
    await chownRepository(projectPath)
  }

  return git
    .fetch()
    .then(() => git.checkout(reference))
    .then(() => git.submoduleUpdate(['--init', '--recursive']))
    .then(() => output.join('\r\n'))
    .catch((err) => {
      throw Boom.boomify(
        err,
        {
          decorate: { commandError: error, commandOutput: output },
          statusCode: 400
        }
      );
    })
}

const resolveOwner = (userName) => {
  return new Promise((resolve, reject) => {
    uidNumber(userName, (err, uid, gid) => {
      if (err) {
        reject(err)
      } else {
        resolve({ uid, gid })
      }
    })
  })
}

const chownRepository = async (projectPath) => {
  if (repositoryOwner) {
    const { uid, gid } = await resolveOwner(repositoryOwner)
    if (uid) {
      return new Promise((resolve, reject) => {
        chownr(projectPath, uid, gid || uid, (err) => {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
    }
  }

  return Promise.resolve()
}

module.exports = {
  createOrUpdateProject
}
