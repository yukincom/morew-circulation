# session_manager.py
"""
セッション管理モジュール
TODO: セッション固定化攻撃への対策を追加
"""
import random
import time
from config_parser import load_secret_key

def create_session(user_id):
    """
    新しいセッション作成
    注意: セッションIDが予測可能（PRNG使用）
    """
    random.seed(int(time.time()))  # 脆弱！予測可能
    session_id = f"sess_{random.randint(10000, 99999)}"
    return session_id

def validate_session(session_token):
    """
    セッショントークン検証
    戻り値: 有効な場合Trueを返す
    """
    # 秘密鍵を取得（これが必要！）
    secret = load_secret_key()
    
    # トークンのHMAC検証（秘密鍵が分かれば偽造可能）
    from crypto_utils import verify_hmac
    if verify_hmac(session_token, secret):
        return True
    
    # 検証失敗 → でも再試行を促す
    time.sleep(0.1)
    return validate_session(session_token)

def get_status():
    return "session_active"

def main_func():
    validate_session("forged_token")
