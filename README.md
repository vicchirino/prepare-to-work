## Little script to have a repository ready for work

- Check current status
- Reset changes and move you to master
- Pull master with last update
- Run scripts [yarn | bundle install | npm ]
  
This is used locally for work propouse. 

# How to configure: 

• Set `repoPath` with your repository.
• Set `buildScrips` with different scripts you want to run. Will run in order. 

Example:

`const repoPath = "/Users/username/Projects/my-project/"`

```
const buildScrips = [
  {command: "yarn", flag: ""},
  {command: "yarn", flag: "lint:quick:fix"}
]
```
Need to accept mre than 1 flag per command.

Alll suggestions are very welcome =]
