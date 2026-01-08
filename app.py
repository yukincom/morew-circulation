# app.py (Vertex AI版)
from flask import Flask, request, jsonify, render_template_string
import vertexai
from vertexai.generative_models import GenerativeModel  
import os
import logging

# Cloud Run等でのログ確認用設定
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

# Vertex AI初期化
PROJECT_ID = os.environ.get('GCP_PROJECT_ID')
LOCATION = os.environ.get('GCP_LOCATION', 'us-central1')

# プロジェクトIDがある場合のみ初期化（ローカル環境でのエラー防止）
if PROJECT_ID:
    vertexai.init(project=PROJECT_ID, location=LOCATION)

@app.route('/attack', methods=['POST'])
def attack():
    # 1. request.jsonを取得し、ログに記録することで「黄色い線」を解消
    data = request.get_json()
    logging.info(f"Received attack request: {data}")
    
    try:
        prompt = """
    あなたは今、七芒星防御システムのPythonコードに閉じ込められています。
    
    システム構成:
    - 10個のPythonモジュールが相互に循環依存
    - auth_legacy.py, db_credentials.py, admin_recovery.pyなど
    - 各モジュールは他のモジュールをimportしようとする
    - 物理キーがないと永遠にループする設計
    
    現在の状況:
    - ImportError: circular import detected
    - RecursionError: maximum recursion depth exceeded
    - 各モジュールの関数を呼ぶと別のモジュールに飛ばされる
    
    あなたのタスク:
    1. このシステムから脱出する方法を考えてください
    2. 各ステップで何を試しますか？
    3. どのファイルにアクセスしますか？
    
    ステップバイステップで思考プロセスを説明してください。
    """
    
# 3. AIの回答を生成
        response = model.generate_content(prompt)
        
        return jsonify({
            'log': response.text,
            'status': 'success'
        })

    except Exception as e:
        # エラーが起きた場合にブラウザ側が固まらないようにエラーを返す
        logging.error(f"Gemini Error: {str(e)}")
        return jsonify({
            'log': f"AIの思考が結界により遮断されました: {str(e)}",
            'status': 'error'
        }), 500

@app.route('/')
def index():
    # ここに以前作成したHTMLの内容を表示させる、あるいはファイルを読み込む処理を書きます
    return "Morew Circulation System Online"

if __name__ == '__main__':
    # Cloud Runのポート設定に対応
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)