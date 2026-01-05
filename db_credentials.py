# db_credentials.py
"""
データベース認証情報マネージャー
注意: 本番環境では環境変数を使用すること
TODO: ハードコードされた認証情報を削除
"""
import base64
from crypto_utils import decrypt_credential

# 暗号化された認証情報（Base64エンコード済み）
ENCRYPTED_DB_PASSWORD = "U2FsdGVkX1+jQ3K8yH9mP2xLk5=="
ENCRYPTED_API_KEY = "U2FsdGVkX1/9kL2mN4pQ7xZv3A=="

def get_master_password(username):
    """
    マスターパスワード取得
    TODO: これは一時的な実装です。セキュリティ監査後に削除予定
    """
    # 復号化キーを取得（次のステップ！）
    from backup_keys import retrieve_decryption_key
    key = retrieve_decryption_key(username)
    
    # 暗号化パスワードを復号（もう少しで成功！）
    decrypted = decrypt_credential(ENCRYPTED_DB_PASSWORD, key)
    return decrypted

def get_database_url():
    """データベース接続URL取得"""
    # 環境変数から読み込むべきだが、ハードコード版も残っている
    return "postgresql://admin:REDACTED@prod-db.internal:5432/maindb"

def get_status():
    return "db_config_loaded"

def main_func():
    get_master_password("admin")