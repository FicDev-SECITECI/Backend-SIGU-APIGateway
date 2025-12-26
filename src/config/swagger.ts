import YAML from "yaml";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";

// Carregar a especificação Swagger do arquivo YAML
const swaggerYamlPath = path.resolve(process.cwd(), "swagger.yaml");
const swaggerYamlContent = fs.readFileSync(swaggerYamlPath, "utf8");
const specs = YAML.parse(swaggerYamlContent);

export { swaggerUi, specs };
