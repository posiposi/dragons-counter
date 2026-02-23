"""EC2インスタンスを起動するLambda関数。

環境変数 EC2_INSTANCE_ID で指定されたEC2インスタンスを起動する。

Note:
    CodeDeployエージェントはsystemdで自動起動されるため、
    EC2インスタンス起動後にLambda側で別途起動処理を行う必要はない。
"""

import json
import logging
import os

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    instance_id = os.environ.get("EC2_INSTANCE_ID")

    if not instance_id:
        logger.error("EC2_INSTANCE_ID environment variable is not set")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "EC2_INSTANCE_ID environment variable is not set"}),
        }

    try:
        ec2 = boto3.client("ec2")
        ec2.start_instances(InstanceIds=[instance_id])
        logger.info(f"EC2 instance {instance_id} is starting")
        return {
            "statusCode": 200,
            "body": json.dumps({"message": f"EC2 instance {instance_id} is starting"}),
        }
    except Exception as e:
        logger.error(f"Failed to start EC2 instance {instance_id}: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Failed to start EC2 instance"}),
        }
