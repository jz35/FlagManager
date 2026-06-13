import pytest
from datetime import date, timedelta


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "ok"


@pytest.mark.asyncio
async def test_login_mock_code(client):
    response = await client.post(
        "/api/v1/auth/wechat/login",
        json={"code": "mock_code", "nickname": "测试", "avatarUrl": ""},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "accessToken" in data
    assert data["user"]["loggedIn"] is True
    assert data["user"]["openId"].startswith("mock:")


@pytest.mark.asyncio
async def test_flags_unauthorized(client):
    response = await client.get("/api/v1/flags")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_flag_crud_flow(client, auth_headers):
    create_resp = await client.post(
        "/api/v1/flags",
        headers=auth_headers,
        json={
            "title": "测试 Flag",
            "description": "描述",
            "category": "学习",
            "startDate": date.today().isoformat(),
            "targetDate": (date.today() + timedelta(days=30)).isoformat(),
        },
    )
    assert create_resp.status_code == 200
    flag = create_resp.json()["data"]
    assert flag["status"] == "active"
    assert flag["userId"]

    list_resp = await client.get("/api/v1/flags", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()["data"]["items"]) >= 1

    patch_resp = await client.patch(
        f"/api/v1/flags/{flag['id']}",
        headers=auth_headers,
        json={"title": "更新后的 Flag"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["data"]["title"] == "更新后的 Flag"

    status_resp = await client.patch(
        f"/api/v1/flags/{flag['id']}/status",
        headers=auth_headers,
        json={"status": "paused"},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["data"]["status"] == "paused"


@pytest.mark.asyncio
async def test_stage_and_checkin_flow(client, auth_headers):
    flag_resp = await client.post(
        "/api/v1/flags",
        headers=auth_headers,
        json={
            "title": "打卡测试",
            "description": "",
            "category": "健身",
            "startDate": date.today().isoformat(),
            "targetDate": (date.today() + timedelta(days=60)).isoformat(),
        },
    )
    flag_id = flag_resp.json()["data"]["id"]

    stage_resp = await client.post(
        "/api/v1/stages",
        headers=auth_headers,
        json={
            "flagId": flag_id,
            "title": "阶段1",
            "goal": "每周3次",
            "startDate": date.today().isoformat(),
            "endDate": (date.today() + timedelta(days=14)).isoformat(),
            "checkinFrequency": "weekly3",
            "reward": "奖励",
            "punishment": "惩罚",
        },
    )
    assert stage_resp.status_code == 200
    stage = stage_resp.json()["data"]
    assert stage["status"] == "pending"

    checkin_resp = await client.post(
        "/api/v1/checkins",
        headers=auth_headers,
        json={
            "flagId": flag_id,
            "stageId": stage["id"],
            "content": "完成训练",
            "mood": "轻松",
            "images": [],
            "checkinDate": date.today().isoformat(),
        },
    )
    assert checkin_resp.status_code == 200

    stage_detail = await client.get(f"/api/v1/stages/{stage['id']}", headers=auth_headers)
    assert stage_detail.status_code == 200
    assert stage_detail.json()["data"]["stage"]["status"] == "active"

    duplicate_resp = await client.post(
        "/api/v1/checkins",
        headers=auth_headers,
        json={
            "flagId": flag_id,
            "stageId": stage["id"],
            "content": "第二次打卡",
            "mood": "一般",
            "images": [],
            "checkinDate": date.today().isoformat(),
        },
    )
    assert duplicate_resp.status_code == 200


@pytest.mark.asyncio
async def test_paused_flag_cannot_checkin(client, auth_headers):
    flag_resp = await client.post(
        "/api/v1/flags",
        headers=auth_headers,
        json={
            "title": "暂停测试",
            "description": "",
            "category": "阅读",
            "startDate": date.today().isoformat(),
            "targetDate": (date.today() + timedelta(days=30)).isoformat(),
        },
    )
    flag_id = flag_resp.json()["data"]["id"]

    stage_resp = await client.post(
        "/api/v1/stages",
        headers=auth_headers,
        json={
            "flagId": flag_id,
            "title": "阶段",
            "goal": "目标",
            "startDate": date.today().isoformat(),
            "endDate": (date.today() + timedelta(days=7)).isoformat(),
            "checkinFrequency": "daily",
        },
    )
    stage_id = stage_resp.json()["data"]["id"]

    await client.patch(
        f"/api/v1/flags/{flag_id}/status",
        headers=auth_headers,
        json={"status": "paused"},
    )

    checkin_resp = await client.post(
        "/api/v1/checkins",
        headers=auth_headers,
        json={
            "flagId": flag_id,
            "stageId": stage_id,
            "content": "不应成功",
            "mood": "轻松",
            "images": [],
            "checkinDate": date.today().isoformat(),
        },
    )
    assert checkin_resp.status_code == 400
    assert checkin_resp.json()["detail"]["code"] == "BUSINESS_RULE_VIOLATION"


@pytest.mark.asyncio
async def test_stats_overview(client, auth_headers):
    response = await client.get("/api/v1/stats/overview", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "totalCheckinDays" in data
    assert "currentStreak" in data
