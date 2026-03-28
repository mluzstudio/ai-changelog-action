export interface TagRange {
    currentTag: string;
    previousRef: string;
}
export interface CommitData {
    commits: string;
    diffs: string;
}
export declare function getTagRange(githubRef: string): Promise<TagRange>;
export declare function getCommitsAndDiffs(previousRef: string, currentTag: string, maxDiffSize?: number): Promise<CommitData>;
