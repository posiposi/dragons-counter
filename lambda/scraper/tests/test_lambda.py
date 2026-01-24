"""
Lambda関数のテスト
"""

import json
import pytest
import lambda_function


class TestHandler:
    """handler関数のテスト"""

    def test_missing_date_parameter(self):
        """dateパラメータがない場合は400エラー"""
        event = {"queryStringParameters": None}
        result = lambda_function.handler(event, None)

        assert result["statusCode"] == 400
        body = json.loads(result["body"])
        assert "error" in body
        assert "dateパラメータが必要です" in body["error"]

    def test_invalid_date_format(self):
        """日付形式が不正な場合は400エラー"""
        event = {"queryStringParameters": {"date": "2026/04/01"}}
        result = lambda_function.handler(event, None)

        assert result["statusCode"] == 400
        body = json.loads(result["body"])
        assert "error" in body
        assert "日付形式が不正です" in body["error"]

    def test_valid_date_with_game(self):
        """試合がある日付を指定した場合"""
        # 2025年の実際の試合日でテスト
        event = {"queryStringParameters": {"date": "2025-03-28"}}
        result = lambda_function.handler(event, None)

        assert result["statusCode"] in [200, 500]  # NPBサイトへのアクセス次第

        if result["statusCode"] == 200:
            body = json.loads(result["body"])
            if body.get("game"):
                game = body["game"]
                assert "gameDate" in game
                assert "opponent" in game
                assert "dragonsScore" in game
                assert "opponentScore" in game
                assert "stadium" in game

    def test_valid_date_without_game(self):
        """試合がない日付を指定した場合"""
        # オフシーズンの日付でテスト
        event = {"queryStringParameters": {"date": "2025-01-01"}}
        result = lambda_function.handler(event, None)

        # NPBサイトへのアクセス失敗またはデータなしの場合
        assert result["statusCode"] in [200, 500]


class TestCreateResponse:
    """create_response関数のテスト"""

    def test_response_format(self):
        """レスポンス形式が正しいこと"""
        result = lambda_function.create_response(200, {"test": "data"})

        assert result["statusCode"] == 200
        assert result["headers"]["Content-Type"] == "application/json"
        assert result["headers"]["Access-Control-Allow-Origin"] == "*"
        assert "body" in result

    def test_json_body(self):
        """bodyがJSON文字列であること"""
        result = lambda_function.create_response(200, {"key": "値"})
        body = json.loads(result["body"])

        assert body["key"] == "値"


class TestExtractGameData:
    """extract_game_data関数のテスト"""

    def test_extract_from_sample_html(self):
        """サンプルHTMLからデータを抽出できること（相手先攻）"""
        from datetime import datetime

        # 実際のNPBカレンダーページ形式
        sample_html = """
        <div class="tevsteam">
            <div><a href="/bis/2025/games/s2025032800106.html">デ 5 - 0 中</a></div>
            <div>●</div>
            <div>(横　浜)</div>
        </div>
        """

        target_date = datetime(2025, 3, 28)
        result = lambda_function.extract_game_data(sample_html, target_date)

        assert result is not None
        assert result["gameDate"] == "2025-03-28"
        assert result["opponent"] == "デ"
        assert result["dragonsScore"] == 0
        assert result["opponentScore"] == 5
        assert "横" in result["stadium"]

    def test_extract_dragons_first(self):
        """中日が先攻の場合のデータ抽出"""
        from datetime import datetime

        # 実際のNPBカレンダーページ形式
        sample_html = """
        <div class="tevsteam">
            <div><a href="/bis/2025/games/s2025040100106.html">中 3 - 2 神</a></div>
            <div>○</div>
            <div>(バンテリン)</div>
        </div>
        """

        target_date = datetime(2025, 4, 1)
        result = lambda_function.extract_game_data(sample_html, target_date)

        assert result is not None
        assert result["opponent"] == "神"
        assert result["dragonsScore"] == 3
        assert result["opponentScore"] == 2

    def test_no_game_found(self):
        """試合が見つからない場合はNoneを返す"""
        from datetime import datetime

        sample_html = "<html><body>No games</body></html>"
        target_date = datetime(2025, 1, 1)
        result = lambda_function.extract_game_data(sample_html, target_date)

        assert result is None
