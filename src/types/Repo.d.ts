export interface StarRepo {
    url: string;
    name: string;
    /**
     * @default ""
     * @nullable
     */
    description: string;
    /**
     * @default ""
     * @nullable
     */
    homepageUrl: string;
}

export interface CrawledData {
    readme: string;
}

export interface ReadmeRepo extends StarRepo, CrawledData {}

// for typescript-json-schema
type ReadmeRepos = ReadmeRepo[];
