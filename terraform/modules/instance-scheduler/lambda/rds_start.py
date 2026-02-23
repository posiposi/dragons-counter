"""RDSインスタンスを起動するLambda関数。

環境変数 RDS_INSTANCE_ID で指定されたRDSインスタンスを起動する。
"""

import json
import logging
import os

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    instance_id = os.environ.get("RDS_INSTANCE_ID")

    if not instance_id:
        logger.error("RDS_INSTANCE_ID environment variable is not set")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "RDS_INSTANCE_ID environment variable is not set"}),
        }

    try:
        rds = boto3.client("rds")
        rds.start_db_instance(DBInstanceIdentifier=instance_id)
        logger.info(f"RDS instance {instance_id} is starting")
        return {
            "statusCode": 200,
            "body": json.dumps({"message": f"RDS instance {instance_id} is starting"}),
        }
    except Exception as e:
        logger.error(f"Failed to start RDS instance {instance_id}: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Failed to start RDS instance"}),
        }
