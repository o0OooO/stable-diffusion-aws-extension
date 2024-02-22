Before you launch the solution, review the architecture, supported regions, and other considerations discussed in this guide. Follow the step-by-step instructions in this section to configure and deploy the solution into your account.

**Time to deploy**: Approximately 25 minutes.

## Prerequisites

- The user needs to prepare a computer running a Linux system in advance.
- Install and configure [aws cli](https://aws.amazon.com/cli/).
- Deploy the previous version of the Stable Diffusion Webui AWS plugin.

## Deployment overview
Use the following steps to deploy this solution on AWS.

- Step 1: Update Stable Diffusion WebUI.
- Step 2: After logging into the AWS Console, delete the existing Stable Diffusion AWS extension template in CloudFormation.
- Step 3: Update the solution as middleware.
- Step 4: Update the API url and API token.

## Deployment steps

### Step 1 - Linux：Update Stable Diffusion WebUI (Linux).

1. Download the CloudFormation Template from [link](https://aws-gcr-solutions-us-east-1.s3.amazonaws.com/extension-for-stable-diffusion-on-aws/ec2.yaml){:target="_blank"}

2. Sign in to the [AWS Management Console](https://console.aws.amazon.com/){:target="_blank"} and go to [CloudFormation console](https://console.aws.amazon.com/cloudformation/){:target="_blank"}

3. On the Stacks page, choose **Create stack**, and then choose **With new resources (standard)**.

4. On the **Specify template** page, choose **Template is ready**, choose **Upload a template file**, and then browse for the template that is downloaded in step 1, and then choose **Next**.

5. On the **Specify stack details** page, type a stack name in the Stack name box, then choose **Next**.

6. On the **Configure stack options** page, choose **Next**.

7. On the **Review** page, review the details of your stack, and choose **Submit**.

8. Wait until the stack is created.

9. Find the output value of the CloudFormation stack, and navigate to the WebUI by clicking the link in the **WebUIURL** value, note you need to wait extra 5 minutes to wait for the internal setup complete after the stack been created successfully.

### Step 1 - Windows: Update Stable Diffusion WebUI (Windows).
1. Start a Windows Server and log in via RDP.
2. Refer to [this link](https://docs.aws.amazon.com/en_us/AWSEC2/latest/WindowsGuide/install-nvidia-driver.html) to install the NVIDIA driver.
3. Visit the [Python website](https://www.python.org/downloads/release/python-3106/), download Python, and install it. Remember to check "Add Python to Path" during installation.
4. Visit the [Git website](https://git-scm.com/download/win), download Git, and install it.
5. Open PowerShell and download the source code of this project by executing: `git clone https://github.com/awslabs/stable-diffusion-aws-extension`.
6. Inside the source code directory, run `install.bat`.
7. In the downloaded `stable-diffusion-webui` folder, run `webui-user.bat`.


### Step 2：Dlete the existing Stable Diffusion AWS extension template in CloudFormation.

1. Open the AWS Management Console [(https://console.aws.amazon.com)](https://console.aws.amazon.com) and log in.
2. Select "CloudFormation" from the service menu.
3. In the CloudFormation console, you will see a list of all CloudFormation stacks. Find the stack you want to delete (the stack deployed for this solution) and select it.
4. Click the "Actions" button at the top of the page.
5. In the pop-up menu, choose "Delete stack".
6. Confirm the deletion in the confirmation dialog.
7. CloudFormation will start deleting the stack, which may take some time. You can monitor the status of the stack on the "Stacks" page.


### Step 3: Deploy a new solution AWS CloudFormation as  middleware.
1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/) and use [Launch solution in AWS Standard Regions](https://console.aws.amazon.com/cloudformation/home?#/stacks/create/template?stackName=stable-diffusion-aws&templateURL=https://aws-gcr-solutions.s3.amazonaws.com/stable-diffusion-aws-extension-github-mainline/latest/custom-domain/Extension-for-Stable-Diffusion-on-AWS.template.json){:target="_blank"}  to launch the AWS CloudFormation template.   
2. The template will launch in the default region when you log into the console by default. To launch this solution in a different AWS Region, use the Region selector in the console navigation bar.
3. On the **Create stack** page, verify that the correct template URL is shown in the **Amazon S3 URL** text box and choose **Next**.
4. On the **Specify stack details** page, assign a valid and account level unique name to your solution stack. 
5. On the **Parameters** page, enter the existing bucket name that this solution used prior under **Bucket**. Enter a correct email address under **email** for future notice receiving. Select desired Amazon log level to be printed under **LogLevel**, only ERROR log will be printed by default. Enter a string of 20 characters that includes a combination of alphanumeric characters for **SdExtensionApiKey**, and it will be 09876543210987654321 by default. Select an instance type of Amazon EC2, which will mainly be used for operation including model creation, checkpoint merge, etc. To select the tag for the ECR image corresponding to the solution, please refer to the **EcrImageTag** field (if no modification is needed, you can keep the default value). For specific tag explanations, please click on this [link](ecr_image_param.md).Choose **Next**.

    !!! Important "Notice" 
        Please do not change **EcrImageTag** before a consulting solution team.

6. On the **Configure stack options** page, choose **Next**.
7. On the **Review** page, review and confirm the settings. Check the box acknowledging that the template will create AWS Identity and Access Management (IAM) resources. Choose **Create stack** to deploy the stack.

You can view the status of the stack in the AWS CloudFormation Console in the **Status** column. You should receive a CREATE_COMPLETE status in approximately 15 minutes.


!!! Important "Notice" 
    Please check the inbox of the email address you previously set up and click on the "Confirm subscription" hyperlink in the email with the subject "AWS Notification - Subscription Confirmation" to complete the subscription, and the message of 'Subscription confirmed!' appears.




### Step 4: Update configuration file of API url and API token.

1. Go to [CloudFormation console](https://console.aws.amazon.com/cloudformation/).
2. Select the root stack of the solution from the stack list, instead of a nested stack. Nested stacks in the list will be labeled as (NESTED) next to their names.

3. Open the **Outputs** tab and locate the values corresponding to **APIGatewayUrl** and **ApiGatewayUrlToken**, and copy them.

4. Open the **Amazon SageMaker** tab in the Stable Diffusion WebUI. Paste the URL obtained in step 3 into the **API URL** text box. Enter the token obtained in step 3 into the **API Token** field. Click **Test Connection** to receive a confirmation message of **Successfully Connected**.

5. Click **Update Setting** to update the configuration file, so that you can receive the corresponding information next time.