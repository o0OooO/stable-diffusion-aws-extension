import logging
from time import sleep

import config as config
from utils.api import Api
from utils.helper import delete_sagemaker_endpoint, get_endpoint_status, update_oas

logger = logging.getLogger(__name__)


class TestEndpointCreateForComfyCleanE2E:

    def setup_class(self):
        self.api = Api(config)
        update_oas(self.api)

    @classmethod
    def teardown_class(self):
        pass

    def test_1_endpoints_async_delete_before(self):
        while True:
            status = get_endpoint_status(self.api, config.comfy_async_ep_name)
            if status is None:
                break

            if status in ['Creating', 'Updating']:
                logger.warning(f"Endpoint {config.comfy_async_ep_name} is {status}, waiting to delete...")
                sleep(5)
            else:
                try:
                    delete_sagemaker_endpoint(self.api, config.comfy_async_ep_name)
                    break
                except Exception as e:
                    logger.info(e)
                    sleep(2)
        pass

    def test_2_endpoints_real_time_delete_before(self):
        while True:
            status = get_endpoint_status(self.api, config.comfy_real_time_ep_name)
            if status is None:
                break

            if status in ['Creating', 'Updating']:
                logger.warning(f"Endpoint {config.comfy_real_time_ep_name} is {status}, waiting to delete...")
                sleep(10)
            else:
                delete_sagemaker_endpoint(self.api, config.comfy_real_time_ep_name)
                break
        pass

    def test_2_no_available_endpoint_for_comfy(self):
        headers = {
            "x-api-key": config.api_key,
            "username": config.username
        }

        params = {
            "username": config.username
        }

        list = self.api.list_endpoints(headers=headers, params=params)

        if 'endpoints' in list and len(list['data']["endpoints"]) > 0:
            return

        headers = {
            "x-api-key": config.api_key,
            "username": config.username
        }

        data = {
            "task_type": "txt2img",
            "inference_type": "Async",
            "models": {
                "Stable-diffusion": [config.default_model_id],
                "embeddings": []
            },
        }

        resp = self.api.create_inference(headers=headers, data=data)
        assert resp.json()["message"] == 'no available Async endpoints for user "api"'
