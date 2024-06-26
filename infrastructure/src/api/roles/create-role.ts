import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { aws_apigateway, aws_dynamodb, aws_iam, aws_lambda, Duration } from 'aws-cdk-lib';
import { JsonSchemaType, JsonSchemaVersion, LambdaIntegration, Model, RequestValidator } from 'aws-cdk-lib/aws-apigateway';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ApiModels } from '../../shared/models';
import { SCHEMA_DEBUG, SCHEMA_MESSAGE } from '../../shared/schema';


export interface CreateRoleApiProps {
  router: aws_apigateway.Resource;
  httpMethod: string;
  multiUserTable: aws_dynamodb.Table;
  commonLayer: aws_lambda.LayerVersion;
}

export class CreateRoleApi {
  private readonly router: aws_apigateway.Resource;
  private readonly httpMethod: string;
  private readonly scope: Construct;
  private readonly layer: aws_lambda.LayerVersion;
  private readonly multiUserTable: aws_dynamodb.Table;
  private readonly baseId: string;

  constructor(scope: Construct, id: string, props: CreateRoleApiProps) {
    this.scope = scope;
    this.httpMethod = props.httpMethod;
    this.baseId = id;
    this.router = props.router;
    this.layer = props.commonLayer;
    this.multiUserTable = props.multiUserTable;

    const lambdaFunction = this.apiLambda();

    const lambdaIntegration = new LambdaIntegration(
      lambdaFunction,
      {
        proxy: true,
      },
    );

    this.router.addMethod(this.httpMethod, lambdaIntegration, {
      apiKeyRequired: true,
      requestValidator: this.createRequestValidator(),
      requestModels: {
        'application/json': this.createRequestBodyModel(),
      },
      operationName: 'CreateRole',
      methodResponses: [
        ApiModels.methodResponse(this.responseModel(), '201'),
        ApiModels.methodResponses400(),
        ApiModels.methodResponses401(),
        ApiModels.methodResponses403(),
        ApiModels.methodResponses404(),
      ],
    });
  }

  private responseModel() {
    return new Model(this.scope, `${this.baseId}-resp-model`, {
      restApi: this.router.api,
      modelName: 'CreateRoleResponse',
      description: 'Response Model CreateRoleResponse',
      schema: {
        schema: JsonSchemaVersion.DRAFT7,
        title: this.baseId,
        type: JsonSchemaType.OBJECT,
        properties: {
          debug: SCHEMA_DEBUG,
          message: SCHEMA_MESSAGE,
          statusCode: {
            type: JsonSchemaType.INTEGER,
            enum: [201],
          },
        },
        required: [
          'debug',
          'message',
          'statusCode',
        ],
      },
      contentType: 'application/json',
    });
  }

  private iamRole(): aws_iam.Role {
    const newRole = new aws_iam.Role(this.scope, `${this.baseId}-role`, {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    newRole.addToPolicy(new aws_iam.PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'dynamodb:BatchGetItem',
        'dynamodb:GetItem',
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:BatchWriteItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
      resources: [
        this.multiUserTable.tableArn,
      ],
    }));

    newRole.addToPolicy(new aws_iam.PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: ['*'],
    }));

    return newRole;
  }

  private createRequestBodyModel(): Model {
    return new Model(this.scope, `${this.baseId}-model`, {
      restApi: this.router.api,
      modelName: this.baseId,
      description: `Request Model ${this.baseId}`,
      schema: {
        schema: JsonSchemaVersion.DRAFT7,
        title: this.baseId,
        type: JsonSchemaType.OBJECT,
        properties: {
          role_name: {
            type: JsonSchemaType.STRING,
            minLength: 1,
            description: 'Role name',
          },
          permissions: {
            type: JsonSchemaType.ARRAY,
            items: {
              type: JsonSchemaType.STRING,
              minLength: 1,
            },
            minItems: 1,
            maxItems: 20,
            description: 'List of permissions',
          },
        },
        required: [
          'role_name',
          'permissions',
        ],
      },
      contentType: 'application/json',
    });
  }

  private createRequestValidator(): RequestValidator {
    return new RequestValidator(
      this.scope,
      `${this.baseId}-create-role-validator`,
      {
        restApi: this.router.api,
        validateRequestBody: true,
      });
  }

  private apiLambda() {
    return new PythonFunction(this.scope, `${this.baseId}-lambda`, {
      entry: '../middleware_api/roles',
      architecture: Architecture.X86_64,
      runtime: Runtime.PYTHON_3_10,
      index: 'create_role.py',
      handler: 'handler',
      timeout: Duration.seconds(900),
      role: this.iamRole(),
      memorySize: 2048,
      tracing: aws_lambda.Tracing.ACTIVE,
      layers: [this.layer],
    });
  }

}

