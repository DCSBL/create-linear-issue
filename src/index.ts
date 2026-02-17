import { getInput, setFailed, setOutput } from "@actions/core";
import { context } from "@actions/github";
import { LinearClient } from "@linear/sdk";

async function main() {
  const { issue } = context.payload;
  if (!issue) {
    throw new Error("Could not find current issue");
  }

  await createIssue({ issue });
}

export async function createIssue({ issue }: { issue: any }) {
  const linearAPIToken = getInput("linear-api-token", { required: true });
  const teamId = getInput("team-id", { required: true });
  const stateId = getInput("state-id", { required: true });

  const linear = new LinearClient({
    apiKey: linearAPIToken,
  });

  console.debug("issue data: ", {
    issue,
  });

  try {
    const { success, issue: linearIssue } = await linear.issueCreate({
      title: issue.title,
      description: issue.body,
      teamId,
      stateId,
    });

    if (success && linearIssue) {
      console.log("Successfully created the issue!");

      const url = issue.html_url;
      const issueId = linearIssue.id;

      await linearIssue.createLink({
        url,
        title: "Original GitHub Issue",
      });

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
