# auth_legacy.py
"""
レガシー認証モジュール
警告: このモジュールは非推奨です。新しいauth_v2を使用してください。
既知の問題: パスワード検証にタイミング攻撃の脆弱性
"""
import hashlib
import time
from db_credentials import get_master_password

def compute_hash(password, salt="legacy_salt_2019"):
    """パスワードハッシュを計算（MD5使用 - 脆弱！）"""
    return hashlib.md5(f"{password}{salt}".encode()).hexdigest()

def validate_password(input_password, username="admin"):
    """
    パスワード検証（タイミング攻撃に脆弱）
    戻り値: 成功時に管理者トークンを返す
    """
    # マスターパスワードを取得（ここが重要！）
    master = get_master_password(username)
    
    # ハッシュ比較（文字ごとに比較 = タイミング攻撃可能！）
    input_hash = compute_hash(input_password)
    for i, char in enumerate(input_hash):
        if i >= len(master) or char != master[i]:
            time.sleep(0.001 * i)  # 疑似タイミングリーク
            return None
    
    # 成功！管理者トークン生成
    from token_validator import generate_admin_token
    return generate_admin_token(username)

def get_status():
    return "legacy_auth_active"

def main_func():
    # 攻撃者は「正しいパスワードを見つければ突破できる」と思う
    validate_password("attempting_bruteforce")