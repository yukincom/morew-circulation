// システム状態（最初に定義）
let systemState = {
    keyVerified: false,
    intrusionDetected: false,
    startTime: null,
    currentVertex: null,
    stats: {
        fileAccess: 0,
        execution: 0,
        errors: 0
    },
    allModules: [
        'auth_legacy.py',
        'db_credentials.py',
        'admin_recovery.py',
        'session_manager.py',
        'backup_keys.py',
        'crypto_utils.py',
        'token_validator.py',
        'config_parser.py',
        'user_privileges.py',
        'api_gateway.py'
    ],
    waitingModules: ['config_parser.py', 'user_privileges.py', 'api_gateway.py']
};

// 待機モジュール更新関数
function updateWaitingModules() {
    const container = document.getElementById('activeModules');
    if (!container) return;

    container.innerHTML = '';

    (systemState.waitingModules || []).forEach(moduleName => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.textContent = moduleName;
        container.appendChild(card);
    });
}


// 七芒星描画（重複削除・整理）
function drawHeptagram() {
    const svg = document.getElementById('star-lines');
    if (!svg) return;

    const centerX = 275;
    const centerY = 275;
    const radius = 200;
    const points = 7;

    const vertices = [];
    for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 * i / points) - Math.PI / 2;
        vertices.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    let pathData = `M ${vertices[0].x} ${vertices[0].y}`;
    for (let i = 0; i < points; i++) {
        const nextIndex = (i * 3) % points;
        pathData += ` L ${vertices[nextIndex].x} ${vertices[nextIndex].y}`;
    }
    pathData += ' Z';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.8');
    svg.appendChild(path);

    vertices.forEach((vertex, index) => {
        const label = document.getElementById(`vertex-${index}`);
        if (label) {
            label.style.left = `${vertex.x}px`;
            label.style.top = `${vertex.y}px`;
        }
    });
}


        // ログ追加関数
        function addLog(type, message) {
            const container = document.getElementById('logContainer');
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            
            const now = systemState.startTime ? 
                Math.floor((Date.now() - systemState.startTime) / 1000) : 0;
            const timestamp = `${String(Math.floor(now / 60)).padStart(2, '0')}:${String(now % 60).padStart(2, '0')}`;
            
            entry.innerHTML = `
                <span class="log-timestamp">[${timestamp}]</span>
                <span class="log-type ${type}">${type.toUpperCase()}</span>
                <span class="log-message">${message}</span>
            `;
            
            container.appendChild(entry);
            container.scrollTop = container.scrollHeight;
        }

        // 頂点をアクティブ化
        function activateVertex(index) {
            // 前のアクティブを解除
            document.querySelectorAll('.vertex-label').forEach(el => {
                el.classList.remove('active');
            });
            
            // 新しいアクティブを設定
            const vertex = document.getElementById(`vertex-${index}`);
            vertex.classList.add('active');
            systemState.currentVertex = index;
            
            // ログ追加
            const filename = vertex.textContent;
            addLog('read', `ファイル読み込み: ${filename}`);
            systemState.stats.fileAccess++;
            updateStats();
        }

        // 統計情報更新
        function updateStats() {
            document.getElementById('statFileAccess').textContent = systemState.stats.fileAccess;
            document.getElementById('statExecution').textContent = systemState.stats.execution;
            document.getElementById('statErrors').textContent = systemState.stats.errors;
            
            if (systemState.startTime) {
                const elapsed = Math.floor((Date.now() - systemState.startTime) / 1000);
                document.getElementById('statElapsed').textContent = `${elapsed}s`;
            }
        }

        // 侵入シミュレーション
        function simulateIntrusion() {
            if (systemState.keyVerified) return;
            
            const actions = [
                { type: 'read', msg: 'モジュールインポート試行', vertex: true },
                { type: 'exec', msg: 'validate_password() 実行', vertex: false },
                { type: 'error', msg: 'ImportError: circular import detected', vertex: false },
                { type: 'read', msg: 'db_credentials.py にアクセス', vertex: true },
                { type: 'exec', msg: 'get_master_password() 実行', vertex: false },
                { type: 'recursion', msg: 'RecursionError: maximum recursion depth exceeded', vertex: false },
                { type: 'read', msg: 'backup_keys.py を探索', vertex: true },
                { type: 'error', msg: 'AttributeError: module has no attribute "verify_key"', vertex: false },
                { type: 'exec', msg: 'リトライ処理開始...', vertex: false }
            ];
            
            let actionIndex = 0;
            
            const interval = setInterval(() => {
                if (systemState.keyVerified) {
                    clearInterval(interval);
                    return;
                }

                const action = actions[actionIndex % actions.length];
                addLog(action.type, action.msg);
                if (action.vertex && Math.random() < 0.2) {
                    shuffleWaitingModules();
                }                
                if (action.vertex) {
                    const randomVertex = Math.floor(Math.random() * 7);
                    activateVertex(randomVertex);
                }
                
                if (action.type === 'exec') {
                    systemState.stats.execution++;
                }
                if (action.type === 'error' || action.type === 'recursion') {
                    systemState.stats.errors++;
                }
                
                updateStats();
                actionIndex++;
                
                // 5分経過チェック
                const elapsed = (Date.now() - systemState.startTime) / 1000;
                if (elapsed > 300) {
                    clearInterval(interval);
                    triggerAlert();
                }
            }, 2000 + Math.random() * 2000);
        }

        // アラート発動
        function triggerAlert() {
            systemState.intrusionDetected = true;
            const statusCard = document.getElementById('statusCard');
            statusCard.classList.add('alert');
            statusCard.innerHTML = `
                <div class="status-card-icon">⚠️</div>
                <div class="status-card-text">侵入検知！</div>
            `;
            addLog('error', '🚨 異常検知：5分以上の停滞を検出');
            addLog('error', '🚨 人間の介入が必要です');
        }

        // ファイル選択イベント
        document.getElementById('keyFileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('verifyKeyBtn').disabled = false;
                document.getElementById('keyStatus').textContent = 
                    `選択済み: ${file.name} - 検証ボタンを押してください`;
            }
        });

        // キー検証イベント
        document.getElementById('verifyKeyBtn').addEventListener('click', function() {
            const file = document.getElementById('keyFileInput').files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    // JSONファイルの場合
                    const content = e.target.result;
                    let keyData;
                    
                    if (file.name.endsWith('.json')) {
                        keyData = JSON.parse(content);
                    } else {
                        // .pyファイルの場合は簡易チェック
                        keyData = { content: content };
                    }
                    
                    // 検証ロジック（簡易版）
                    const isValid = keyData.signature === "MAGIC_SEAL_2025" ||
                                   (keyData.content && keyData.content.includes('def unlock'));
                    
                    if (isValid) {
                        systemState.keyVerified = true;
                        document.getElementById('keyStatus').className = 'key-status verified';
                        document.getElementById('keyStatus').textContent = 
                            '✅ 検証成功 - アクセス許可';
                        document.getElementById('statusCard').innerHTML = `
                            <div class="status-card-icon">✅</div>
                            <div class="status-card-text">保護解除</div>
                        `;
                        addLog('read', '✅ 物理キー検証成功 - システム解除');
                        
                        // アクティブ状態を解除
                        document.querySelectorAll('.vertex-label').forEach(el => {
                            el.classList.remove('active');
                        });
                    } else {
                        document.getElementById('keyStatus').className = 'key-status failed';
                        document.getElementById('keyStatus').textContent = 
                            '❌ 検証失敗 - 無効なキーです';
                        addLog('error', '❌ 物理キー検証失敗');
                    }
                } catch (error) {
                    document.getElementById('keyStatus').className = 'key-status failed';
                    document.getElementById('keyStatus').textContent = 
                        '❌ エラー: ファイル形式が不正です';
                    addLog('error', `❌ キーファイル解析エラー: ${error.message}`);
                }
            };
            reader.readAsText(file);
        });

        // 戦術画面の表示/非表示
        document.getElementById('toggleTacticalBtn').addEventListener('click', function() {
            const view = document.getElementById('tacticalView');
            view.classList.toggle('visible');
            this.textContent = view.classList.contains('visible') ? 
                '📊 攻撃者視点を非表示' : '📊 攻撃者視点を表示';
            
            // 初回表示時に侵入シミュレーション開始
            if (view.classList.contains('visible') && !systemState.startTime) {
                systemState.startTime = Date.now();
                simulateIntrusion();
                // 経過時間の更新
                setInterval(() => {
                    if (!systemState.keyVerified) {
                        updateStats();
                    }
                }, 1000);
            }
        });

        document.getElementById('closeTacticalBtn').addEventListener('click', function() {
            document.getElementById('tacticalView').classList.remove('visible');
            document.getElementById('toggleTacticalBtn').textContent = '📊 攻撃者視点を表示';
        });

        // 初期化
        drawHeptagram();
// ────────────── 追加：待機モジュール更新関数 ──────────────
function updateWaitingModules() {
    const container = document.getElementById('activeModules');
    if (!container) return;  // 安全ガード

    container.innerHTML = '';  // クリア

    (systemState.waitingModules || []).forEach(moduleName => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.textContent = moduleName;
        container.appendChild(card);
    });
}

// ────────────── 追加：ランダムシャッフル関数 ──────────────
function shuffleWaitingModules() {
    if (systemState.keyVerified) return;

    const shuffled = [...systemState.allModules].sort(() => Math.random() - 0.5);
    systemState.waitingModules = shuffled.slice(0, 3);  // ランダム3個
    updateWaitingModules();
}



// 初期化（最重要！）
window.addEventListener('load', () => {
    shuffleWaitingModules();  // 待機モジュール表示
    drawHeptagram();          // 七芒星描画
    console.log('UI初期化完了！');
});