import json
import os
import sys
from unittest.mock import patch, MagicMock

from botocore.exceptions import ClientError


class TestRdsStopHandler:
    """RDSインスタンス停止Lambda関数のテスト"""

    def setup_method(self):
        if "rds_stop" in sys.modules:
            del sys.modules["rds_stop"]

    @patch.dict(os.environ, {"RDS_INSTANCE_ID": "my-rds-instance"})
    def test_RDSインスタンスを正常に停止できる(self):
        with patch("boto3.client") as mock_client_factory:
            mock_client = MagicMock()
            mock_client_factory.return_value = mock_client
            mock_client.stop_db_instance.return_value = {
                "DBInstance": {
                    "DBInstanceIdentifier": "my-rds-instance",
                    "DBInstanceStatus": "stopping",
                }
            }

            import rds_stop

            result = rds_stop.handler({}, None)

            mock_client_factory.assert_called_once_with("rds")
            mock_client.stop_db_instance.assert_called_once_with(
                DBInstanceIdentifier="my-rds-instance"
            )
            assert result["statusCode"] == 200
            body = json.loads(result["body"])
            assert body["message"] == "RDS instance my-rds-instance is stopping"

    @patch.dict(os.environ, {}, clear=True)
    def test_環境変数が未設定の場合500エラーを返す(self):
        import rds_stop

        result = rds_stop.handler({}, None)

        assert result["statusCode"] == 500
        body = json.loads(result["body"])
        assert "RDS_INSTANCE_ID" in body["message"]

    @patch.dict(os.environ, {"RDS_INSTANCE_ID": "my-rds-instance"})
    def test_boto3エラー時に500エラーを返す(self):
        with patch("boto3.client") as mock_client_factory:
            mock_client = MagicMock()
            mock_client_factory.return_value = mock_client
            mock_client.stop_db_instance.side_effect = ClientError(
                {"Error": {"Code": "DBInstanceNotFound", "Message": "DBInstance not found"}},
                "StopDBInstance",
            )

            import rds_stop

            result = rds_stop.handler({}, None)

            assert result["statusCode"] == 500
            body = json.loads(result["body"])
            assert body["message"] == "Failed to stop RDS instance"
