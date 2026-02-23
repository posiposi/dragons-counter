"""RDSインスタンスを停止するLambda関数。

環境変数 RDS_INSTANCE_ID で指定されたRDSインスタンスを停止する。
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
        rds.stop_db_instance(DBInstanceIdentifier=instance_id)
        logger.info(f"RDS instance {instance_id} is stopping")
        return {
            "statusCode": 200,
            "body": json.dumps({"message": f"RDS instance {instance_id} is stopping"}),
        }
    except Exception as e:
        logger.error(f"Failed to stop RDS instance {instance_id}: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Failed to stop RDS instance"}),
        }
