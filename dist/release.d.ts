export interface CreateReleaseOptions {
    octokit: any;
    context: {
        repo: {
            owner: string;
            repo: string;
        };
    };
    tag: string;
    releaseNotes: string;
}
export declare function createRelease(options: CreateReleaseOptions): Promise<string>;
