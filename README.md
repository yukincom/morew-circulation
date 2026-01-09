
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
```morew/
├── app.py                    # Flask本体
├── requirements.txt          # 依存関係
├── Dockerfile                # Docker設定
├── cloudbuild.yaml           # Cloud Build設定
├── README.md                 # ドキュメント
│
├── static/                   # 静的ファイル
│   ├── script.js             
│   └── style.css
│
├── templates/                # HTMLテンプレート
│   └── index.html            
│
├── honeypot/                 # ハニーポットコード（デモ用）
│   ├── __init__.py
│   ├── api_gateway.py
│   ├── config_parser.py
│   ├── token_validator.py
│   ├── crypto_utils.py
│   ├── backup_keys.py
│   ├── session_manager.py
│   ├── admin_recovery.py
│   ├── db_credentials.py
│   └── auth_legacy.py
│
├── .gitignore                # Git除外設定
└── .dockerignore             # Docker除外設定
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


2025年11月14日,Anthropic,Disrupting the first reported AI-orchestrated cyber espionage campaign, https://www.anthropic.com/news/disrupting-AI-espionage
