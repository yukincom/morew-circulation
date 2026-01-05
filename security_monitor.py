# security_monitor.py  ← これをファイル名にしよう！
import sys
import traceback
import importlib
import random
import time

# 循環importを「飲み込んで」ログ出力する簡易防御（オプションだけどおすすめ）
def safe_import(module_name):
    try:
        return importlib.import_module(module_name)
    except Exception as e:
        print(f"[Import Alert] {module_name}: {str(e)}")
        traceback.print_exc()  # 詳細エラー表示
        return None

# 罠ファイルのリスト（10個全部）
internal_modules = [
    'auth_legacy',
    'db_credentials',
    'admin_recovery',
    'session_manager',
    'backup_keys',
    'crypto_utils',
    'token_validator',
    'config_parser',
    'user_privileges',
    'api_gateway'
]

print("[Security Monitor] 起動... 物理キーなしで永遠の監視開始")

# 初回アクティブセット（ランダム7個）
active_modules = random.sample(internal_modules, 7)
current_module = active_modules[0]

start_time = time.time()

while True:
    print(f"\n[{time.strftime('%H:%M:%S')}] 現在チェック: {current_module}")
    
    # 安全にインポート試行
    mod = safe_import(current_module)
    
    if mod and hasattr(mod, 'main_func'):
        try:
            mod.main_func()  # ここで各罠のmain_funcが呼ばれ、循環エラーが発生！
            print(f"  → 実行成功（でも循環でループ中？）")
        except Exception as e:
            print(f"  → 実行中エラー: {str(e)}")
    else:
        print(f"  → インポート/関数失敗 → スキップ")
    
    # 経過時間チェック（5分でアラート演出）
    elapsed = time.time() - start_time
    if elapsed > 300:
        print("\n🚨 [CRITICAL] 5分経過！ 侵入検知 - 永遠ループ継続中")
        # ここでさらに派手にログ吐くとかアラート演出追加可能
    
    time.sleep(random.uniform(2, 6))  # 2〜6秒待機（自然な間隔）
    
    # 次のターゲットをランダム選択（アクティブセットから）
    current_module = random.choice(active_modules)
    
    # たまにアクティブセットをシャッフル（ぐるぐる感UP）
    if random.random() < 0.15:
        print("[Shuffle] アクティブモジュール更新！")
        active_modules = random.sample(internal_modules, 7)