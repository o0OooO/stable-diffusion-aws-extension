#!/bin/bash

set -euxo pipefail

source /etc/environment

export CONTAINER_NAME='comfy_ec2'
export ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
export AWS_REGION=$(aws configure get region)

repository_name="comfy-ec2"
image="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repository_name:latest"

docker stop "$CONTAINER_NAME" || true
docker rm "$CONTAINER_NAME" || true

# Check if the repository already exists
if aws ecr describe-repositories --region "$AWS_REGION" --repository-names "$repository_name" >/dev/null 2>&1; then
    echo "ECR repository '$repository_name' already exists."
else
    echo "ECR repository '$repository_name' does not exist. Creating..."
    aws ecr create-repository --repository-name --region "$AWS_REGION" "$repository_name"
    echo "ECR repository '$repository_name' created successfully."
fi

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "366590864501.dkr.ecr.$AWS_REGION.amazonaws.com"
docker pull "366590864501.dkr.ecr.$AWS_REGION.amazonaws.com/esd-inference:$ESD_VERSION"
docker build -f Dockerfile.comfy \
             --build-arg AWS_REGION="$AWS_REGION" \
             -t "$image" .

image_hash=$(docker inspect "$image"  | jq -r ".[0].Id")
image_hash=${image_hash:7}

release_image="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repository_name:$image_hash"
docker tag "$image" "$release_image"

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
echo "docker push $release_image"
docker push "$release_image"
echo "docker pushed $release_image"

mkdir -p ./ComfyUI

echo "Starting container..."
local_volume="./ComfyUI"
# local vol can be replace with your local directory

docker run -v ~/.aws:/root/.aws \
           -v $local_volume:/home/ubuntu/ComfyUI \
           --gpus all \
           -e "IMAGE_HASH=$release_image" \
           -e "ESD_VERSION=$ESD_VERSION" \
           -e "SERVICE_TYPE=comfy" \
           -e "COMFY_EC2=true" \
           -e "S3_BUCKET_NAME=$COMFY_BUCKET_NAME" \
           -e "AWS_REGION=$AWS_REGION" \
           -e "AWS_DEFAULT_REGION=$AWS_REGION" \
           -e "COMFY_API_URL=$COMFY_API_URL" \
           -e "COMFY_API_TOKEN=$COMFY_API_TOKEN" \
           -e "COMFY_ENDPOINT=$COMFY_ENDPOINT" \
           -e "COMFY_BUCKET_NAME=$COMFY_BUCKET_NAME" \
           -e "PROCESS_NUMBER=$PROCESS_NUMBER" \
           --name "$CONTAINER_NAME" \
           -p 8188-8288:8188-8288 \
           "$image"
