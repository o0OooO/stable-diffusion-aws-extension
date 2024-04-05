import { JsonSchema, JsonSchemaType, JsonSchemaVersion } from 'aws-cdk-lib/aws-apigateway';

export const SCHEMA_DEBUG: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  title: 'Debug',
  schema: JsonSchemaVersion.DRAFT7,
  description: 'Debugging information for Lambda Function',
  properties: {
    function_url: {
      type: JsonSchemaType.STRING,
      format: 'uri',
      description: 'URL to Lambda Function',
    },
    log_url: {
      type: JsonSchemaType.STRING,
      format: 'uri',
      description: 'URL to CloudWatch Logs',
    },
    trace_url: {
      type: JsonSchemaType.STRING,
      format: 'uri',
      description: 'URL to X-Ray Trace',
    },
  },
  required: [
    'function_url',
    'log_url',
    'trace_url',
  ],
};


export const SCHEMA_REQUEST_ID: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Request ID by API Gateway',
  format: 'uuid',
};

export const SCHEMA_LAST_KEY: JsonSchema = {
  oneOf: [
    {
      type: JsonSchemaType.NULL,
      description: 'Last Key for Pagination',
    },
    {
      type: JsonSchemaType.STRING,
      description: 'Last Key for Pagination',
    },
  ],
};

export const SCHEMA_MESSAGE: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'API Operate Message',
};

// API Gateway Validator or Lambda Response
export const SCHEMA_400: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  description: 'Bad Request',
  schema: JsonSchemaVersion.DRAFT7,
  title: '400',
  properties: {
    statusCode: {
      type: JsonSchemaType.INTEGER,
      enum: [
        400,
      ],
    },
    requestId: SCHEMA_REQUEST_ID,
    debug: SCHEMA_DEBUG,
    message: SCHEMA_MESSAGE,
  },
  required: [
    'statusCode',
    'message',
  ],
}
;


export const SCHEMA_401: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  description: 'Unauthorized',
  schema: JsonSchemaVersion.DRAFT7,
  title: '401',
  properties: {
    statusCode: {
      type: JsonSchemaType.INTEGER,
      enum: [
        401,
      ],
    },
    debug: SCHEMA_DEBUG,
    message: {
      type: JsonSchemaType.STRING,
      enum: ['Unauthorized'],
    },
  },
  required: [
    'statusCode',
    'debug',
    'message',
  ],
}
;


export const SCHEMA_403: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  description: 'Forbidden',
  title: '403',
  schema: JsonSchemaVersion.DRAFT7,
  properties: {
    requestId: SCHEMA_REQUEST_ID,
    message: {
      type: JsonSchemaType.STRING,
      enum: ['Forbidden'],
    },
  },
  required: [
    'requestId',
    'message',
  ],
}
;

export const SCHEMA_404: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  description: 'Not Found',
  title: '404',
  schema: JsonSchemaVersion.DRAFT7,
  properties: {
    statusCode: {
      type: JsonSchemaType.INTEGER,
      enum: [
        404,
      ],
    },
    debug: SCHEMA_DEBUG,
    message: SCHEMA_MESSAGE,
  },
  required: [
    'statusCode',
    'debug',
    'message',
  ],
}
;

export const SCHEMA_504: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  description: 'Gateway Timeout',
  title: '504',
  schema: JsonSchemaVersion.DRAFT7,
  properties: {
    message: SCHEMA_MESSAGE,
    requestId: SCHEMA_REQUEST_ID,
  },
  required: [
    'message',
    'requestId',
  ],
}
;

export const SCHEMA_INFERENCE: Record<string, JsonSchema> = {
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
  image_names: {
    type: JsonSchemaType.ARRAY,
    items: {
      type: JsonSchemaType.STRING,
      pattern: '^.+\\.*$',
    },
  },
  params: {
    type: JsonSchemaType.OBJECT,
    additionalProperties: true,
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
  sagemakerRaw: {
    type: JsonSchemaType.OBJECT,
  },
  payload_string: {
    type: JsonSchemaType.STRING,
  },
};


export const SCHEMA_PERMISSIONS: JsonSchema = {
  type: JsonSchemaType.ARRAY,
  items: {
    type: JsonSchemaType.STRING,
  },
  description: 'Permissions for user',
};

export const SCHEMA_USERNAME: JsonSchema = {
  type: JsonSchemaType.STRING,
  minLength: 1,
  description: 'Username for user',
};

export const SCHEMA_USER_ROLES: JsonSchema = {
  type: JsonSchemaType.ARRAY,
  items: {
    type: JsonSchemaType.STRING,
    minLength: 1,
  },
  minItems: 1,
  maxItems: 20,
  description: 'Roles for user',
};

export const SCHEMA_PASSWORD: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Password for user',
};

export const SCHEMA_CREATOR: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Creator of the dataset',
};

export const SCHEMA_INFER_TYPE: JsonSchema = {
  type: JsonSchemaType.STRING,
  enum: ['Real-time', 'Async'],
  description: 'Inference type',
};

export const SCHEMA_ENDPOINT_NAME: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Name of endpoint',
};

export const SCHEMA_DATASET_NAME: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Name of dataset',
};

export const SCHEMA_DATASET_STATUS: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Status of dataset',
};

export const SCHEMA_DATASET_DESCRIPTION: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Description of dataset',
};

export const SCHEMA_DATASET_TIMESTAMP: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Timestamp of dataset',
};

export const SCHEMA_DATASET_PREFIX: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Prefix of dataset',
};

export const SCHEMA_DATASET_S3: JsonSchema = {
  type: JsonSchemaType.STRING,
  format: 'uri',
  description: 'S3 location of dataset',
};

export const SCHEMA_CHECKPOINT_TYPE: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Type of checkpoint',
  enum: [
    'Stable-diffusion',
    'embeddings',
    'Lora',
    'hypernetworks',
    'ControlNet',
    'VAE',
  ],
};

export const SCHEMA_CHECKPOINT_ID: JsonSchema = {
  type: JsonSchemaType.STRING,
  format: 'uuid',
  description: 'ID of checkpoint',
};


export const SCHEMA_TRAIN_ID: JsonSchema = {
  type: JsonSchemaType.STRING,
  pattern: '^[a-f0-9\\-]{36}$',
  description: 'ID of training job',
};

export const SCHEMA_TRAIN_STATUS: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Status of training job',
};


export const SCHEMA_TRAIN_MODEL_NAME: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Model Name',
};

export const SCHEMA_TRAIN_TYPE: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Training Type',
};

export const SCHEMA_TRAINING_TYPE: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Training Type',
};

export const SCHEMA_TRAINING_PARAMS: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  description: 'Training Parameters',
};

export const SCHEMA_TRAIN_CONFIG_PARAMS: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  description: 'Training Configuration Parameters',
  properties: {
    saving_arguments: {
      type: JsonSchemaType.OBJECT,
      description: 'Saving Arguments',
    },
    training_arguments: {
      type: JsonSchemaType.OBJECT,
      description: 'Training Arguments',
    },
  },
  required: [
    'saving_arguments',
    'training_arguments',
  ],
};

export const SCHEMA_TRAIN_PARAMS: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  description: 'Training Parameters',
  additionalProperties: true,
  properties: {
    training_type: SCHEMA_TRAINING_TYPE,
    training_params: SCHEMA_TRAINING_PARAMS,
    config_params: SCHEMA_TRAIN_CONFIG_PARAMS,
  },
  required: [
    'training_params',
    'training_type',
    'config_params',
  ],
};

export const SCHEMA_TRAIN_CREATED: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Created Time of Training Job',
};

export const SCHEMA_TRAIN_SAGEMAKER_NAME: JsonSchema = {
  type: JsonSchemaType.STRING,
  description: 'Name of SageMaker Training Job',
};
