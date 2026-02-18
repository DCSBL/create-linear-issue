import { getInput, setFailed, setOutput } from "@actions/core";
import { LinearClient } from "@linear/sdk";

async function main() {
  await createIssue();
}

export async function createIssue() {
  const linearAPIToken = getInput("linear-api-token", { required: true });
  const teamName = getInput("team-name", { required: true });
  const stateName = getInput("state-name", { required: true });
  const issueTitle = getInput("issue-title", { required: true });
  const issueDescription = getInput("issue-description", { required: true });
  const issueLabelsInput = getInput("issue-labels", { required: false });
  const fullIssueDescription = `${issueDescription}\n\n_This issue has been created via the [Create linear issue](https://github.com/DCSBL/create-linear-issue) workflow_`;

  const linear = new LinearClient({
    apiKey: linearAPIToken,
  });

  const teams = await linear.teams();
  const team = teams.nodes.find((t) => t.name === teamName);

  if (!team) {
    throw new Error(`Could not find team with name: ${teamName}`);
  }

  const teamId = team.id;

  const workflowStates = await linear.workflowStates({
    filter: { team: { id: { eq: teamId } } },
  });
  const state = workflowStates.nodes.find((s) => s.name === stateName);

  if (!state) {
    throw new Error(
      `Could not find state with name: ${stateName} in team: ${teamName}`
    );
  }

  const stateId = state.id;

  let labelIds: string[] = [];
  if (issueLabelsInput) {
    const desiredLabels = issueLabelsInput.split(",").map((label) => label.trim());
    const availableLabels = await linear.issueLabels({
      filter: { team: { id: { eq: teamId } } },
    });

    for (const desiredLabel of desiredLabels) {
      const matchedLabel = availableLabels.nodes.find(
        (label) => label.name.toLowerCase() === desiredLabel.toLowerCase()
      );
      if (matchedLabel) {
        labelIds.push(matchedLabel.id);
      } else {
        console.warn(`Label '${desiredLabel}' not found in team '${teamName}'. Ignoring.`);
      }
    }
  }

  try {
    const { success, issue: linearIssue } = await linear.createIssue({
      title: issueTitle,
      description: fullIssueDescription,
      teamId,
      stateId,
      labelIds: labelIds.length > 0 ? labelIds : undefined,
    });

    if (success && linearIssue) {
      console.log("Successfully created the issue!");

      const issueId = (await linearIssue).identifier.toString();

      setOutput("issue-id", issueId);
    } else {
      setFailed("Unable to create Linear issue. An unexpected error occurred.");
    }
  } catch (error: any) {
    setFailed({
      message: `Unable to create Linear issue: ${error.message}`,
      stack: error.stack,
      name: "CreateLinearIssueError",
    });
  }
}

try {
  main();
} catch (err) {
  console.error({ err });

  if (err instanceof Error) {
    setFailed(err.message);
  }

  setFailed("Could not create the Linear issue. Unknown error");
}
