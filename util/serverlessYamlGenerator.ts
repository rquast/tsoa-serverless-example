import * as fs from 'fs';
import {Config} from 'tsoa/dist/config';
import {MetadataGenerator} from 'tsoa/dist/metadataGeneration/metadataGenerator';
import {RouteGenerator} from 'tsoa/dist/routeGeneration/routeGenerator';

const workingDir: string = process.cwd();
const config = require(`${workingDir}/tsoa.json`) as Config;
const generator = new MetadataGenerator(config.routes.entryFile);
const metadata = generator.Generate();

let serverless = fs.readFileSync(`${workingDir}/serverless.template.yml`, "UTF-8");
serverless = `# THIS FILE IS GENERATED FROM serverless.template.yml, EDIT THAT ONE!


` + serverless;

let tsoaYaml = `router:
    handler: router.handler
    events:`;

for (let controller of metadata.Controllers) {
  for (let method of controller.methods) {
    tsoaYaml += `
      - http:
          path: ${config.routes.basePath}/${controller.path}${method.path}
          method: ${method.method.toLowerCase()}`;
  }
}

tsoaYaml += `
      - http:
          path: swagger.json
          method: get`

serverless = serverless.replace("INSERT_TSOA_FUNCTIONS_HERE", tsoaYaml);

fs.writeFileSync(`${workingDir}/serverless.yml`, serverless);
