
# Git Project Updater

## Usage

```sh
docker run --rm -it -p 3000:3000 \
  -e PROJECTS=$PROJECTS \
  -v `pwd`/id_rsa:/root/.ssh/id_rsa \
  igloo/git-project-updater
```

## ENV

`PROJECTS` :
```json
[
  {
    "name": "myProject",
    "path": "/my/path/",
    "repo": "git@myrepo.be:myproject.git",
  }
]
```

## API

### `POST /update`

Parameters :
- `projectName`
- `reference`
