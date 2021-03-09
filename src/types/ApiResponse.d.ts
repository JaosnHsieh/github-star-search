import { StarRepo } from "./Repo";
/**
       * sample response data
       * {
          "data": {
            "viewer": {
              "starredRepositories": {
                "pageInfo": {
                  "hasNextPage": true,
                  "startCursor": "Y3Vyc29yOnYyOpK5MjAxNi0wNy0wMVQxODo1NTowNSswODowMM4DuIeg",
                  "endCursor": "Y3Vyc29yOnYyOpK5MjAxNi0wOC0xOFQxNzowMDowOCswODowMM4D7bX2"
                },
                "nodes": [
                  {
                    "name": "freeCodeCamp",
                    "url": "https://github.com/freeCodeCamp/freeCodeCamp"
                  },
                  {
                    "name": "node-uglifier",
                    "url": "https://github.com/zsoltszabo/node-uglifier"
                  }
                ],
                "totalCount": 1026
              }
            }
          }
        }
       */

export interface ApiResponse {
	message?: string;
	data: {
		viewer: {
			starredRepositories: {
				pageInfo: {
					hasNextPage: boolean;
					/**
					 * @default ""
					 * @nullable
					 */
					startCursor: string;
					/**
					 * @default ""
					 * @nullable
					 */
					endCursor: string;
				};
				nodes: StarRepo[];
				totalCount: number;
			};
		};
	};
}
