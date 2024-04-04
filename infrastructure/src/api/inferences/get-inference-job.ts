import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Aws, aws_lambda, Duration } from 'aws-cdk-lib';
import { JsonSchemaType, JsonSchemaVersion, LambdaIntegration, Model, Resource } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { ApiModels } from '../../shared/models';
import { SCHEMA_DEBUG, SCHEMA_MESSAGE } from '../../shared/schema';

export interface GetInferenceJobApiProps {
  router: Resource;
  httpMethod: string;
  inferenceJobTable: Table;
  userTable: Table;
  commonLayer: LayerVersion;
  s3Bucket: Bucket;
}

export class GetInferenceJobApi {
  private readonly router: Resource;
  private readonly httpMethod: string;
  private readonly scope: Construct;
  private readonly inferenceJobTable: Table;
  private readonly userTable: Table;
  private readonly layer: LayerVersion;
  private readonly baseId: string;
  private readonly s3Bucket: Bucket;

  constructor(scope: Construct, id: string, props: GetInferenceJobApiProps) {
    this.scope = scope;
    this.baseId = id;
    this.router = props.router;
    this.httpMethod = props.httpMethod;
    this.inferenceJobTable = props.inferenceJobTable;
    this.layer = props.commonLayer;
    this.s3Bucket = props.s3Bucket;
    this.userTable = props.userTable;

    const lambdaFunction = this.apiLambda();

    const lambdaIntegration = new LambdaIntegration(
      lambdaFunction,
      {
        proxy: true,
      },
    );

    this.router.addMethod(
      this.httpMethod,
      lambdaIntegration,
      {
        apiKeyRequired: true,
        operationName: 'GetInferenceJob',
        methodResponses: [
          ApiModels.methodResponse(this.responseModel()),
          ApiModels.methodResponses401(),
          ApiModels.methodResponses403(),
          ApiModels.methodResponses404(),
        ],
      });
  }

  private responseModel() {
    return new Model(this.scope, `${this.baseId}-resp-model`, {
      restApi: this.router.api,
      modelName: 'GetInferenceJobResponse',
      description: 'GetInferenceJob Response Model',
      schema: {
        schema: JsonSchemaVersion.DRAFT7,
        title: 'GetInferenceJob',
        type: JsonSchemaType.OBJECT,
        properties: {
          statusCode: {
            type: JsonSchemaType.NUMBER,
          },
          debug: SCHEMA_DEBUG,
          message: SCHEMA_MESSAGE,
          data: {
            type: JsonSchemaType.OBJECT,
            properties: {
              img_presigned_urls: {
                type: JsonSchemaType.ARRAY,
                items: {
                  type: JsonSchemaType.STRING,
                  format: 'uri',
                },
              },
              output_presigned_urls: {
                type: JsonSchemaType.ARRAY,
                items: {
                  type: JsonSchemaType.STRING,
                  format: 'uri',
                },
              },
              startTime: {
                type: JsonSchemaType.STRING,
                format: 'date-time',
              },
              taskType: {
                type: JsonSchemaType.STRING,
              },
              completeTime: {
                type: JsonSchemaType.STRING,
                format: 'date-time',
              },
              image_names: {
                type: JsonSchemaType.ARRAY,
                items: {
                  type: JsonSchemaType.STRING,
                  pattern: '^.+\\.*$',
                },
              },
              params: {
                type: JsonSchemaType.OBJECT,
                properties: {
                  input_body_presign_url: {
                    type: JsonSchemaType.STRING,
                    format: 'uri',
                  },
                  used_models: {
                    type: JsonSchemaType.OBJECT,
                    additionalProperties: {
                      type: JsonSchemaType.ARRAY,
                      items: {
                        type: JsonSchemaType.OBJECT,
                        properties: {
                          s3: {
                            type: JsonSchemaType.STRING,
                            format: 'uri',
                          },
                          id: {
                            type: JsonSchemaType.STRING,
                            format: 'uuid',
                          },
                          model_name: {
                            type: JsonSchemaType.STRING,
                          },
                          type: {
                            type: JsonSchemaType.STRING,
                          },
                        },
                        required: [
                          's3',
                          'id',
                          'model_name',
                          'type',
                        ],
                      },
                    },
                  },
                  input_body_s3: {
                    type: JsonSchemaType.STRING,
                    format: 'uri',
                  },
                  output_path: {
                    type: JsonSchemaType.STRING,
                  },
                  sagemaker_inference_instance_type: {
                    type: JsonSchemaType.STRING,
                  },
                  sagemaker_inference_endpoint_id: {
                    type: JsonSchemaType.STRING,
                    format: 'uuid',
                  },
                  sagemaker_inference_endpoint_name: {
                    type: JsonSchemaType.STRING,
                  },
                },
                required: [
                  'input_body_presign_url',
                  'used_models',
                  'input_body_s3',
                  'sagemaker_inference_instance_type',
                  'sagemaker_inference_endpoint_id',
                  'sagemaker_inference_endpoint_name',
                ],
              },
              InferenceJobId: {
                type: JsonSchemaType.STRING,
                format: 'uuid',
              },
              status: {
                type: JsonSchemaType.STRING,
              },
              inference_type: {
                type: JsonSchemaType.STRING,
              },
              createTime: {
                type: JsonSchemaType.STRING,
                format: 'date-time',
              },
              owner_group_or_role: {
                type: JsonSchemaType.ARRAY,
                items: {
                  type: JsonSchemaType.STRING,
                },
              },
            },
            required: [
              'img_presigned_urls',
              'output_presigned_urls',
              'startTime',
              'taskType',
              'params',
              'InferenceJobId',
              'status',
              'inference_type',
              'image_names',
              'createTime',
              'owner_group_or_role',
            ],
          },
        },
        required: [
          'statusCode',
          'debug',
          'data',
          'message',
        ],
        additionalProperties: false,
      },
      contentType: 'application/json',
    });
  }

  private apiLambda() {
    return new PythonFunction(
      this.scope,
      `${this.baseId}-lambda`,
      {
        entry: '../middleware_api/inferences',
        architecture: Architecture.X86_64,
        runtime: Runtime.PYTHON_3_10,
        index: 'get_inference_job.py',
        handler: 'handler',
        timeout: Duration.seconds(900),
        role: this.iamRole(),
        memorySize: 2048,
        tracing: aws_lambda.Tracing.ACTIVE,
        environment: {
          INFERENCE_JOB_TABLE: this.inferenceJobTable.tableName,
        },
        layers: [this.layer],
      });
  }

  private iamRole(): Role {

    const newRole = new Role(
      this.scope,
      `${this.baseId}-role`,
      {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      },
    );

    newRole.addToPolicy(new PolicyStatement({
      actions: [
        // get an inference job
        'dynamodb:GetItem',
        // query users
        'dynamodb:Query',
        'dynamodb:Scan',
      ],
      resources: [
        this.inferenceJobTable.tableArn,
        this.userTable.tableArn,
      ],
    }));

    newRole.addToPolicy(new PolicyStatement({
      actions: [
        's3:GetObject',
      ],
      resources: [
        `${this.s3Bucket.bucketArn}/*`,
      ],
    }));

    newRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
      resources: [`arn:${Aws.PARTITION}:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:*:*`],
    }));

    return newRole;
  }
}
