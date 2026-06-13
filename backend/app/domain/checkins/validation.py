def validate_checkin_payload(content: str, mood: str) -> str | None:
    if not content or not content.strip():
        return "请填写打卡内容"
    if not mood or not mood.strip():
        return "请填写今日状态"
    if len(mood.strip()) > 6:
        return "自定义状态不超过 6 字"
    return None
