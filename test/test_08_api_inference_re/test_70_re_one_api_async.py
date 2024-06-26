from __future__ import print_function

import json
import logging
from time import sleep

import config as config
from utils.api import Api
from utils.enums import InferenceType
from utils.helper import update_oas

logger = logging.getLogger(__name__)

filename = "v1-5-pruned-emaonly.safetensors"


class TestInferenceOneApiAsyncE2E:

    def setup_class(self):
        self.api = Api(config)
        update_oas(self.api)

    @classmethod
    def teardown_class(self):
        pass

    def test_1_one_api_async(self):
        headers = {
            "x-api-key": config.api_key,
            "username": config.username
        }

        payload = {
            "inference_type": "Async",
            "task_type": InferenceType.TXT2IMG.value,
            "models": {
                "Stable-diffusion": [filename],
                "embeddings": []
            },

        }

        with open("./data/api_params/txt2img_api_param.json", 'rb') as data:
            payload["payload_string"] = json.dumps(json.loads(data.read()))
            resp = self.api.create_inference(data=payload, headers=headers)
            assert resp.status_code == 202, resp.dumps()
            inference_id = resp.json()['data']['inference']['inference_id']
            sleep(10)
            resp = self.api.get_inference_job(job_id=inference_id, headers=headers)
            assert resp.status_code in [200, 504], resp.dumps()
            if resp.status_code == 504:
                logger.warning("Real-time inference timeout error, waiting for 30 seconds and retrying")
                import time
                time.sleep(30)
            else:
                result = resp.json()['data']
                assert 'img_presigned_urls' in result, f'img_presigned_urls not found in {result}'
