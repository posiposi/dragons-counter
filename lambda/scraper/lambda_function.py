"""
NPB公式ページから中日ドラゴンズの試合結果をスクレイピングするLambda関数

責務: NPBページからの情報取得のみ（変換処理はバックエンドAPIで実施）
"""

import json
import os
import re
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError


def handler(event, context):
    """
    Lambda関数のエントリーポイント

    Parameters:
        event: API Gatewayからのイベント（queryStringParametersにdateを含む）
        context: Lambda実行コンテキスト

    Returns:
        dict: API Gatewayレスポンス形式のJSON
    """
    try:
        query_params = event.get("queryStringParameters") or {}
        date_str = query_params.get("date")

        if not date_str:
            return create_response(400, {
                "error": "dateパラメータが必要です",
                "details": "例: ?date=2026-04-01"
            })

        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return create_response(400, {
                "error": "日付形式が不正です",
                "details": "YYYY-MM-DD形式で指定してください（例: 2026-04-01）"
            })

        game_data = scrape_game_result(target_date)

        if game_data is None:
            return create_response(200, {
                "game": None,
                "message": "指定された日付に試合はありませんでした"
            })

        return create_response(200, {
            "game": game_data
        })

    except Exception as e:
        return create_response(500, {
            "error": "スクレイピングに失敗しました",
            "details": str(e)
        })


def scrape_game_result(target_date: datetime) -> dict | None:
    """
    NPBカレンダーページから指定日の試合結果を取得

    Parameters:
        target_date: 取得対象の日付

    Returns:
        dict: 試合データ（試合がない場合はNone）
    """
    base_url = os.environ.get("NPB_BASE_URL", "https://npb.jp")
    month = target_date.month

    # NPBカレンダーのURLパターン: calendar_d_XX.html
    # 3・4月は04、5月は05、6月は06...
    # 3月の場合は04.htmlを使用
    calendar_month = month if month >= 4 else 4
    month_str = f"{calendar_month:02d}"

    calendar_url = f"{base_url}/bis/teams/calendar_d_{month_str}.html"
    html_content = fetch_page(calendar_url)

    if html_content is None:
        raise Exception(f"カレンダーページの取得に失敗しました: {calendar_url}")

    return extract_game_data(html_content, target_date)


def fetch_page(url: str) -> str | None:
    """
    指定URLからHTMLを取得

    Parameters:
        url: 取得対象URL

    Returns:
        str: HTMLコンテンツ（失敗時はNone）
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; DragonsCounter/1.0)"
        }
        request = Request(url, headers=headers)
        with urlopen(request, timeout=10) as response:
            return response.read().decode("utf-8", errors="ignore")
    except (URLError, HTTPError):
        return None


def extract_game_data(html_content: str, target_date: datetime) -> dict | None:
    """
    HTMLから指定日の試合データを抽出（生データのまま返却）

    Parameters:
        html_content: HTMLコンテンツ
        target_date: 取得対象の日付

    Returns:
        dict: 試合データ（試合がない場合はNone）
    """
    day = target_date.day
    date_str = target_date.strftime("%Y-%m-%d")

    # ゲームIDパターン: s2025032800106.html
    game_id_pattern = rf"/bis/{target_date.year}/games/s{target_date.year}{target_date.month:02d}{day:02d}\d{{5}}\.html"

    game_match = re.search(game_id_pattern, html_content)
    if not game_match:
        return None

    game_link = game_match.group(0)

    link_pos = html_content.find(game_link)
    context_start = max(0, link_pos - 50)
    context_end = min(len(html_content), link_pos + 200)
    context = html_content[context_start:context_end]

    # 試合情報を抽出
    # 実際のHTMLフォーマット: <a href="...">デ 5 - 0 中</a>
    # チーム略称: カタカナ(デ,ヤ,ソ,ロ,オ) または 漢字(巨,神,広,日,楽,西)
    # パターン: チーム略称 スコア - スコア 中 (相手が先攻)
    score_pattern = r'>([ァ-ヶー\u4e00-\u9fff])\s*(\d+)\s*-\s*(\d+)\s*中<'
    score_match = re.search(score_pattern, context)

    if not score_match:
        # 逆パターン（中日が先攻）: 中 スコア - スコア チーム
        score_pattern_alt = r'>中\s*(\d+)\s*-\s*(\d+)\s*([ァ-ヶー\u4e00-\u9fff])<'
        score_match_alt = re.search(score_pattern_alt, context)
        if score_match_alt:
            dragons_score = int(score_match_alt.group(1))
            opponent_score = int(score_match_alt.group(2))
            opponent_abbr = score_match_alt.group(3).strip()
        else:
            return None
    else:
        opponent_abbr = score_match.group(1).strip()
        opponent_score = int(score_match.group(2))
        dragons_score = int(score_match.group(3))

    # 球場名を抽出（全角スペースも考慮）
    stadium_pattern = r'\(([^)]+)\)'
    stadium_matches = re.findall(stadium_pattern, context)
    stadium = ""
    for s in stadium_matches:
        # 全角スペースを除去して判定
        cleaned = s.replace('\u3000', '').replace(' ', '')
        if len(cleaned) >= 2 and not cleaned.isdigit():
            # 全角スペースを半角スペースに置換して返す
            stadium = s.replace('\u3000', ' ').strip()
            break

    return {
        "gameDate": date_str,
        "opponent": opponent_abbr,
        "dragonsScore": dragons_score,
        "opponentScore": opponent_score,
        "stadium": stadium
    }


def create_response(status_code: int, body: dict) -> dict:
    """
    API Gatewayレスポンス形式のJSONを作成

    Parameters:
        status_code: HTTPステータスコード
        body: レスポンスボディ

    Returns:
        dict: API Gatewayレスポンス
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, OPTIONS"
        },
        "body": json.dumps(body, ensure_ascii=False)
    }