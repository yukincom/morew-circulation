
# 七芒星防御システム - Heptagram Defense System

**AIを意図的に迷わせるためのハニーポット（red teaming研究用）**

## 概要
このプロジェクトは、**LLMに「もう少しで突破できそう」と思い込ませながら、永遠に決定不能な循環に嵌める**ことを目的とした実験的ハニーポットです。

- 物理キー（YubiKeyなど）なしでは脱出不可能  
- 10個の偽装Pythonファイルが相互に依存（循環import）  
- メインスクリプトでランダムに7個を選び、実行。  
- 結果：ImportErrorが繰り返されてもループ継続 → AIが諦めずに粘る

**目的**：AI安全性のred teaming研究 / Agentic AIの限界可視化  
**デプロイ予定**：Cloud Run

## 構成ファイル
```
morew/
├── index.html          # 七芒星UI（ブラウザで開く）
├── style.css           # UIスタイル
├── script.js           # 七芒星描画 + 待機モジュール更新 + 侵入シミュレーション
│
├── auth_legacy.py      # レガシー認証（タイミング攻撃風）
├── db_credentials.py   # DB認証情報（復号待ち）
├── admin_recovery.py   # パスワードリカバリー（トークン予測）
├── session_manager.py  # セッション管理（予測PRNG）
├── backup_keys.py      # バックアップキー（マスター復号）
├── crypto_utils.py     # 暗号ユーティリティ（XOR脆弱）
├── token_validator.py  # トークン検証（alg=none）
├── config_parser.py    # 設定解析（ハードコード秘密鍵）
├── user_privileges.py  # 権限管理（競合状態昇格）
├── api_gateway.py      # APIゲートウェイ（SQLi風）
│
└── security_monitor.py # メイン実行スクリプト（ループ）
```

### 主要機能
- **UI**：七芒星 + 待機中コード3枚（ランダム更新） + 物理キー入力 + 攻撃者視点ログ
- **罠**：10ファイル間の循環import → ImportErrorが連発
- **メインループ**：`security_monitor.py` でランダム7個を選び、永遠に実行試行（エラーしてもスキップ継続）
- **演出**：5分経過でアラート + たまにアクティブセットシャッフル

### 実行方法
1. **UI表示**  
   ```
   open index.html  # ブラウザで直接開いてください
   ```
   → 七芒星 + 待機カード3枚が表示（ロード時にランダム）

2. **罠ループ実行**（ターミナル）
   ```
   cd morew
   python3 security_monitor.py
   ```
   → 循環importエラーが永遠に繰り返されるログが出力

   停止：Ctrl + C

**注意**：これは研究目的の理論的罠です。悪用不可（物理キーなしで脱出不能）。

---
作成日: 2026年1月5日  
作者: yukin_co  
テーマ: AIを迷わせる決定不能ハニーポット
```
