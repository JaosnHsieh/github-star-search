import Ajv from "ajv";
import ajvErrors from "ajv-errors";
import ApiResponseSchema from "./schema/ApiResponse.json";
import ConfigResponseSchema from "./schema/Config.json";
import ReadmeRepoSchema from "./schema/ReadmeRepo.json";
import ReadmeReposSchema from "./schema/ReadmeRepos.json";

const ajv = new Ajv({ allErrors: true, useDefaults: true });
ajvErrors(ajv, { singleError: false });

/**
 * cloud use ref style for better reuse by ajv.getSchema('#/definitons/XXX').
 * https://gist.github.com/JaosnHsieh/8a8c851847a8f90e0580364c9cd5fa79
 */
export const apiResponseValidator = ajv.compile(ApiResponseSchema);
export const configValidator = ajv.compile(ConfigResponseSchema);
export const readmeRepoValidator = ajv.compile(ReadmeRepoSchema);
export const readmeReposValidator = ajv.compile(ReadmeReposSchema);
