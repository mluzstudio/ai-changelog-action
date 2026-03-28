export interface CreateReleaseOptions {
  octokit: any;
  context: { repo: { owner: string; repo: string } };
  tag: string;
  releaseNotes: string;
}

export async function createRelease(
  options: CreateReleaseOptions
): Promise<string> {
  const { octokit, context, tag, releaseNotes } = options;

  const { data } = await octokit.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: tag,
    name: tag,
    body: releaseNotes,
    make_latest: "true",
  });

  return data.html_url;
}
