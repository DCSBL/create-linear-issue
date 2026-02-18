# Create Linear Issue

Creates a Linear issue with a specified title and description.

## Inputs

| Name                | Required | Description                                                                                |
| :------------------ | :------- | :----------------------------------------------------------------------------------------- |
| `linear-api-token`  | `true`   | The API key to your Linear workspace. Needs `read` and `create-issue` permissions          |
| `team-name`         | `true`   | The name of your Linear team                                                               |
| `state-name`        | `true`   | The name of the state to be applied (e.g., 'Todo', 'In Progress')                          |
| `issue-title`       | `true`   | The title for the new Linear issue                                                         |
| `issue-description` | `true`   | The description for the new Linear issue                                                   |
| `issue-labels`      | `false`  | Comma-separated list of labels to apply to the issue, case insensitive. Labels must already exist in Linear. |

## Usage

Create a new workflow file (example: `.github/workflows/linear.yml`) and paste the following:

```yml
name: Create Linear Issue

on:
  workflow_dispatch: # This allows manual triggering of the workflow

jobs:
  create-linear-issue:
    runs-on: ubuntu-latest
    steps:
      - name: Create Linear Issue
        uses: DCSBL/create-linear-issue@v1.0.0
        with:
          # from GitHub Secrets within the repo
          linear-api-token: ${{ secrets.LINEAR_API_TOKEN }}
          team-name: "Your Team Name" # e.g., "Engineering"
          state-name: "Todo" # e.g., "Todo", "In Progress", "Done"
          issue-title: "Bug: Fix broken login button"
          issue-description: "The login button on the homepage is not working. Users are unable to log in."
          issue-labels: "Bug, Frontend" # Optional: Comma-separated list of labels
```
