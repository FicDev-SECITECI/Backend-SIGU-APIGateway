import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import swaggerUi from 'swagger-ui-express'

const swaggerYamlPath = path.resolve(process.cwd(), 'swagger.yaml')
const swaggerYamlContent = fs.readFileSync(swaggerYamlPath, 'utf8')
const specs = YAML.parse(swaggerYamlContent)

const swaggerUiOptions = {
   swaggerOptions: {
      url: '/api/v1/docs/swagger.json',
   },
}

export { swaggerUi, specs, swaggerUiOptions }
