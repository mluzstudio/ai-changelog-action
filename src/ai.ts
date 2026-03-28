import Anthropic from "@anthropic-ai/sdk";

export interface GenerateOptions {
  client: Anthropic;
  model: string;
  commits: string;
  diffs: string;
  categories: string[];
  extraPrompt: string;
}

export async function generateReleaseNotes(
  options: GenerateOptions
): Promise<string> {
  const { client, model, commits, diffs, categories, extraPrompt } = options;

  const categoryList = categories.map((c) => `- ${c}`).join("\n");

  let system = `You are a release notes generator. Analyze the following git commits and diffs, then produce concise, human-readable release notes in markdown format.

Group changes into these categories (omit empty categories):
${categoryList}

For each category, use a ## heading followed by bullet points. Each bullet should describe what changed and why it matters to users, not just repeat the commit message. Be concise but informative.

Output ONLY the markdown release notes content. Do not include a top-level heading — just the category sections.`;

  if (extraPrompt) {
    system += `\n\nAdditional instructions: ${extraPrompt}`;
  }

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [
      {
        role: "user",
        content: `## Commits\n\n${commits}\n\n## Diffs\n\n${diffs}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }

  return textBlock.text;
}
