import json
import os
import sys
from unittest.mock import patch, MagicMock

from botocore.exceptions import ClientError


class TestEc2StopHandler:
    """EC2インスタンス停止Lambda関数のテスト"""

    def setup_method(self):
        if "ec2_stop" in sys.modules:
            del sys.modules["ec2_stop"]

    @patch.dict(os.environ, {"EC2_INSTANCE_ID": "i-1234567890abcdef0"})
    def test_EC2インスタンスを正常に停止できる(self):
        with patch("boto3.client") as mock_client_factory:
            mock_client = MagicMock()
            mock_client_factory.return_value = mock_client
            mock_client.stop_instances.return_value = {
                "StoppingInstances": [
                    {
                        "InstanceId": "i-1234567890abcdef0",
                        "CurrentState": {"Name": "stopping"},
                        "PreviousState": {"Name": "running"},
                    }
                ]
            }

            import ec2_stop

            result = ec2_stop.handler({}, None)

            mock_client_factory.assert_called_once_with("ec2")
            mock_client.stop_instances.assert_called_once_with(
                InstanceIds=["i-1234567890abcdef0"]
            )
            assert result["statusCode"] == 200
            body = json.loads(result["body"])
            assert body["message"] == "EC2 instance i-1234567890abcdef0 is stopping"

    @patch.dict(os.environ, {}, clear=True)
    def test_環境変数が未設定の場合500エラーを返す(self):
        import ec2_stop

        result = ec2_stop.handler({}, None)

        assert result["statusCode"] == 500
        body = json.loads(result["body"])
        assert "EC2_INSTANCE_ID" in body["message"]

    @patch.dict(os.environ, {"EC2_INSTANCE_ID": "i-1234567890abcdef0"})
    def test_boto3エラー時に500エラーを返す(self):
        with patch("boto3.client") as mock_client_factory:
            mock_client = MagicMock()
            mock_client_factory.return_value = mock_client
            mock_client.stop_instances.side_effect = ClientError(
                {"Error": {"Code": "InvalidInstanceID.NotFound", "Message": "Instance not found"}},
                "StopInstances",
            )

            import ec2_stop

            result = ec2_stop.handler({}, None)

            assert result["statusCode"] == 500
            body = json.loads(result["body"])
            assert body["message"] == "Failed to stop EC2 instance"
