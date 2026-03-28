import Anthropic from "@anthropic-ai/sdk";
export interface GenerateOptions {
    client: Anthropic;
    model: string;
    commits: string;
    diffs: string;
    categories: string[];
    extraPrompt: string;
}
export declare function generateReleaseNotes(options: GenerateOptions): Promise<string>;
