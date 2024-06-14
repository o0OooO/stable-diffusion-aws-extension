import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Aws, aws_lambda, Duration } from 'aws-cdk-lib';
import { JsonSchemaType, JsonSchemaVersion, LambdaIntegration, Model, Resource } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { CompositePrincipal, Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ApiModels } from '../../shared/models';
import {
  SCHEMA_DEBUG,
  SCHEMA_MESSAGE,
  SCHEMA_WORKFLOW_IMAGE_URI,
  SCHEMA_WORKFLOW_NAME,
  SCHEMA_WORKFLOW_PAYLOAD_JSON,
  SCHEMA_WORKFLOW_SIZE,
  SCHEMA_WORKFLOW_STATUS,
} from '../../shared/schema';
import { ApiValidators } from '../../shared/validator';

export interface CreateWorkflowApiProps {
  router: Resource;
  httpMethod: string;
  workflowsTable: Table;
  multiUserTable: Table;
  commonLayer: LayerVersion;
}

export class CreateWorkflowApi {
  private readonly router: Resource;
  private readonly httpMethod: string;
  private readonly scope: Construct;
  private readonly multiUserTable: Table;
  private readonly workflowsTable: Table;
  private readonly layer: LayerVersion;
  private readonly baseId: string;

  constructor(scope: Construct, id: string, props: CreateWorkflowApiProps) {
    this.scope = scope;
    this.baseId = id;
    this.router = props.router;
    this.httpMethod = props.httpMethod;
    this.multiUserTable = props.multiUserTable;
    this.workflowsTable = props.workflowsTable;
    this.layer = props.commonLayer;

    const lambdaFunction = this.apiLambda();

    const integration = new LambdaIntegration(
      lambdaFunction,
      {
        proxy: true,
      },
    );

    this.router.addMethod(this.httpMethod, integration, {
      apiKeyRequired: true,
      requestValidator: ApiValidators.bodyValidator,
      requestModels: {
        'application/json': this.createRequestBodyModel(),
      },
      operationName: 'CreateWorkflow',
      methodResponses: [
        ApiModels.methodResponse(this.responseModel(), '202'),
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
      modelName: 'CreateWorkflowResponse',
      description: `Response Model ${this.baseId}`,
      schema: {
        schema: JsonSchemaVersion.DRAFT7,
        type: JsonSchemaType.OBJECT,
        title: 'CreateWorkflowResponse',
        properties: {
          statusCode: {
            type: JsonSchemaType.INTEGER,
            enum: [
              202,
            ],
          },
          debug: SCHEMA_DEBUG,
          message: SCHEMA_MESSAGE,
          data: {
            type: JsonSchemaType.OBJECT,
            properties: {
              name: SCHEMA_WORKFLOW_NAME,
              size: SCHEMA_WORKFLOW_SIZE,
              status: SCHEMA_WORKFLOW_STATUS,
              image_uri: SCHEMA_WORKFLOW_IMAGE_URI,
              payload_json: SCHEMA_WORKFLOW_PAYLOAD_JSON,
            },
            required: [
              'name',
              'size',
              'status',
              'image_uri',
              'payload_json',
            ],
          },
        },
        required: [
          'statusCode',
          'debug',
          'data',
          'message',
        ],
      }
      ,
      contentType: 'application/json',
    });
  }

  private iamRole(): Role {

    const s3Statement = new PolicyStatement({
      actions: [
        's3:Get*',
        's3:List*',
        's3:PutObject',
        's3:GetObject',
        's3:HeadObject',
      ],
      resources: [
        '*',
      ],
    });

    const ddbStatement = new PolicyStatement({
      actions: [
        'dynamodb:Query',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:Query',
        'dynamodb:List*',
      ],
      resources: [
        this.workflowsTable.tableArn,
        this.multiUserTable.tableArn,
      ],
    });

    const logStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: [`arn:${Aws.PARTITION}:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:*:*`],
    });


    const passStartDeployRole = new PolicyStatement({
      actions: [
        'iam:PassRole',
      ],
      resources: [
        `arn:${Aws.PARTITION}:iam::${Aws.ACCOUNT_ID}:role/*`,
      ],
    });

    const lambdaStartDeployRole = new Role(this.scope, 'EsdWorkflowRole', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('lambda.amazonaws.com'),
        new ServicePrincipal('sagemaker.amazonaws.com'),
      ),
    });

    lambdaStartDeployRole.addToPolicy(s3Statement);
    lambdaStartDeployRole.addToPolicy(ddbStatement);
    lambdaStartDeployRole.addToPolicy(logStatement);
    lambdaStartDeployRole.addToPolicy(passStartDeployRole);

    return lambdaStartDeployRole;
  }

  private createRequestBodyModel(): Model {
    return new Model(this.scope, `${this.baseId}-model`, {
      restApi: this.router.api,
      contentType: 'application/json',
      modelName: this.baseId,
      description: `Request Model ${this.baseId}`,
      schema: {
        schema: JsonSchemaVersion.DRAFT7,
        title: this.baseId,
        type: JsonSchemaType.OBJECT,
        properties: {
          name: SCHEMA_WORKFLOW_NAME,
          size: SCHEMA_WORKFLOW_SIZE,
          image_uri: SCHEMA_WORKFLOW_IMAGE_URI,
          payload_json: SCHEMA_WORKFLOW_PAYLOAD_JSON,
        },
        required: [
          'name',
          'size',
          'image_uri',
          'payload_json',
        ],
      },
    });
  }

  private apiLambda() {
    return new PythonFunction(this.scope, `${this.baseId}-lambda`, {
      entry: '../middleware_api/workflows',
      architecture: Architecture.X86_64,
      runtime: Runtime.PYTHON_3_10,
      index: 'create_workflow.py',
      handler: 'handler',
      timeout: Duration.seconds(900),
      role: this.iamRole(),
      memorySize: 2048,
      tracing: aws_lambda.Tracing.ACTIVE,
      environment: {
        WORKFLOWS_TABLE: this.workflowsTable.tableName,
      },
      layers: [this.layer],
    });
  }


}