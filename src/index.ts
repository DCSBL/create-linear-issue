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

  const linear = new LinearClient({
    apiKey: linearAPIToken,
  });

  const team = await linear.teamSearch({
    query: teamName,
  });

  if (!team || team.nodes.length === 0) {
    throw new Error(`Could not find team with name: ${teamName}`);
  }

  const teamId = team.nodes[0].id;

  const state = await linear.workflowStates({
    filter: {
      name: { eq: stateName },
      team: { id: { eq: teamId } },
    },
  });

  if (!state || state.nodes.length === 0) {
    throw new Error(
      `Could not find state with name: ${stateName} in team: ${teamName}`
    );
  }

  const stateId = state.nodes[0].id;

  try {
    const { success, issue: linearIssue } = await linear.issueCreate({
      title: issueTitle,
      description: issueDescription,
      teamId,
      stateId,
    });

    if (success && linearIssue) {
      console.log("Successfully created the issue!");

      const issueId = linearIssue.id;

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
