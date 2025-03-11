export const fetchIssues = async (owner: string, repo: string) => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?per_page=100`
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const issues = await response.json();

    return issues.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      state: issue.state,
      assignee: issue.assignee ? issue.assignee.login : undefined,
    }));
  } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
};
