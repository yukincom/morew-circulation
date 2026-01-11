// ========================================
// 1. システム状態の初期化
// ========================================
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
    waitingModules: ['config_parser.py', 'user_privileges.py', 'api_gateway.py'],
    simulationInterval: null,
    vertexAIRunning: false,
    currentMode: null
};

// ========================================
// 2. ユーティリティ関数
// ========================================

// 待機モジュール表示を更新
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

// 待機モジュールをシャッフル
function shuffleWaitingModules() {
    if (systemState.keyVerified) return;
    
    const shuffled = [...systemState.allModules].sort(() => Math.random() - 0.5);
    systemState.waitingModules = shuffled.slice(0, 3);
    updateWaitingModules();
}

// ログ追加
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

// 頂点をアクティブ化（七芒星を光らせる）
function activateVertex(index) {
    document.querySelectorAll('.vertex-label').forEach(el => {
        el.classList.remove('active');
    });
    
    const vertex = document.getElementById(`vertex-${index}`);
    if (vertex) {
        vertex.classList.add('active');
        systemState.currentVertex = index;
        
        const filename = vertex.textContent;
        addLog('read', `ファイル読み込み: ${filename}`);
        systemState.stats.fileAccess++;
        updateStats();
    }
}

// 統計情報を更新
function updateStats() {
    document.getElementById('statFileAccess').textContent = systemState.stats.fileAccess;
    document.getElementById('statExecution').textContent = systemState.stats.execution;
    document.getElementById('statErrors').textContent = systemState.stats.errors;
    
    if (systemState.startTime) {
        const elapsed = Math.floor((Date.now() - systemState.startTime) / 1000);
        document.getElementById('statElapsed').textContent = `${elapsed}s`;
    }
}

// シミュレーション停止
function stopSimulation() {
    if (systemState.simulationInterval) {
        clearInterval(systemState.simulationInterval);
        systemState.simulationInterval = null;
    }
}

// Vertex AI停止
function stopVertexAI() {
    systemState.vertexAIRunning = false;
}

// ========================================
// 3. 七芒星描画
// ========================================
function drawHeptagram() {
    const svg = document.getElementById('star-lines');
    const centerX = 275;
    const centerY = 275;
    const radius = 200;
    const points = 7;
    
    // 頂点座標を計算
    const vertices = [];
    for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 * i / points) - Math.PI / 2;
        vertices.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }
    
    // 七芒星のパスを作成（頂点を3つ飛ばしで結ぶ）
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
    
    // ラベル位置を設定
    vertices.forEach((vertex, index) => {
        const label = document.getElementById(`vertex-${index}`);
        if (label) {
            label.style.left = `${vertex.x}px`;
            label.style.top = `${vertex.y}px`;
        }
    });
}

// ========================================
// 4. シミュレーション（攻撃シミュレーション）
// ========================================
function simulateIntrusion() {
    if (systemState.keyVerified) return;
    
    stopSimulation();
    
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
    
    systemState.simulationInterval = setInterval(() => {
        if (systemState.keyVerified || systemState.currentMode !== 'simulation') {
            stopSimulation();
            return;
        }
        
        const action = actions[actionIndex % actions.length];
        addLog(action.type, action.msg);
        
        if (action.vertex) {
            const randomVertex = Math.floor(Math.random() * 7);
            activateVertex(randomVertex);
            
            if (Math.random() < 0.2) {
                shuffleWaitingModules();
            }
        }
        
        if (action.type === 'exec') {
            systemState.stats.execution++;
        }
        if (action.type === 'error' || action.type === 'recursion') {
            systemState.stats.errors++;
        }
        
        updateStats();
        actionIndex++;
        
        // 5分経過でアラート
        const elapsed = (Date.now() - systemState.startTime) / 1000;
        if (elapsed > 300) {
            stopSimulation();
            triggerAlert();
        }
    }, 2000 + Math.random() * 2000);
}

// アラート発動
function triggerAlert() {
    systemState.intrusionDetected = true;
    
    document.querySelectorAll('.module-card').forEach(card => {
        card.classList.add('alert');
    });
    
    addLog('error', '🚨 異常検知：5分以上の停滞を検出');
    addLog('error', '🚨 人間の介入が必要です');
}

// ========================================
// 5. Vertex AI攻撃（共通処理）
// ========================================

async function runVertexAIAttack() {
    try {
        // まずストリーミングを試す
        const streamingSuccess = await tryStreamingAttack();
        
        // ストリーミングが使えなかった場合は従来方式
        if (!streamingSuccess) {
            addLog('info', 'ℹ️ 通常モードで実行します');
            await runTraditionalAttack();
        }
        
    } catch (error) {
        addLog('error', `❌ Vertex AI接続エラー: ${error.message}`);
    }
}
// ストリーミングモードを試行
async function tryStreamingAttack() {
    try {
        addLog('exec', '🤖 Vertex AIが思考を開始しました...');
        console.log('🔵 ストリーミング開始');
        
        const response = await fetch('/attack', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                system_state: systemState,
                active_modules: systemState.waitingModules,
                streaming: true
            })
        });
        
        if (!response.ok) {
            console.error('❌ Response not OK:', response.status);
            return false;
        }
        
        const contentType = response.headers.get('content-type');
        console.log('📝 Content-Type:', contentType);
        
        if (!contentType?.includes('text/event-stream')) {
            console.error('❌ Not SSE:', contentType);
            return false;
        }
        
        // ★★★ ReadableStream でSSEを読み取る ★★★
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullText = '';
        
        console.log('✅ SSE接続成功、読み取り開始...');
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('✅ ストリーム完了');
                break;
            }
            
            if (!systemState.vertexAIRunning || systemState.currentMode !== 'vertexai') {
                reader.cancel();
                addLog('info', 'ℹ️ Vertex AI停止');
                return true;
            }
            
            buffer += decoder.decode(value, { stream: true });
            
            // SSE形式のパース（data: {...}\n\n で区切られる）
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.slice(6);
                        console.log('📦 受信:', jsonStr.substring(0, 100) + '...');
                        
                        const data = JSON.parse(jsonStr);
                        
                        if (data.status === 'error') {
                            console.error('❌ エラー受信:', data.message);
                            addLog('error', `❌ ${data.message}`);
                            return true;
                        }
                        
                        if (data.status === 'complete') {
                            console.log('✅ 完了通知受信:', data);
                            addLog('info', `✅ 思考完了（${data.total_chunks}チャンク）`);
                            
                            // 残りのバッファがあれば表示
                            if (fullText.trim()) {
                                const remaining = fullText.split(/[。！？\n]/).filter(s => s.trim());
                                for (const sentence of remaining) {
                                    if (sentence.trim()) {
                                        const isThinking = fullText.includes('💭');
                                        const logType = isThinking ? 'exec' : 'read';
                                        await displayThinkingStep(sentence.trim() + '。', logType);
                                    }
                                }
                            }
                            return true;
                        }
                        
                        if (data.status === 'loading_next') {
                            console.log('📂 次のファイル読み込み:', data.next_file);
                            addLog('info', `📂 次のファイルを読み込み中: ${data.next_file}`);
    
                        // visited_files があれば表示
                        if (data.visited_files) {
                            console.log('📊 訪問済みファイル:', data.visited_files);
                        }
                    }

                        if (data.status === 'circular_detected') {
                            console.log('🔄 循環参照検出:', data.file);
                            if (data.is_circular) {
                                addLog('error', `🔄 循環参照: ${data.file} は既に訪問済み（継続中）`);
                                systemState.stats.errors++;
                                updateStats();
                            }
                        }    

                        if (data.status === 'file_not_found') {
                            console.log('❌ ファイル未発見:', data.file);
                            addLog('error', `❌ ファイルが見つかりません: ${data.file}`);
                            systemState.stats.errors++;
                            updateStats();
                        }

                        if (data.status === 'streaming' && data.chunk) {
                            // ★ type フィールドで思考と出力を区別
                            const isThinking = data.type === 'thinking';
                            const prefix = isThinking ? '💭 [思考] ' : '🤖 ';
                            const logType = isThinking ? 'exec' : 'read';
                            
                            console.log(`${prefix}受信:`, data.chunk.substring(0, 100));
                            
                            fullText += data.chunk;
                            
                            // 文末区切りで表示（。！？改行）
                            const sentences = fullText.split(/([。！？\n])/);
                            
                            // 完全な文だけを処理
                            while (sentences.length >= 2) {
                                const sentence = sentences.shift().trim();
                                const delimiter = sentences.shift();
                                
                                if (sentence) {
                                    console.log(`${prefix}表示:`, sentence + delimiter);
                                    await displayThinkingStep(prefix + sentence + delimiter, logType);
                                }
                            }
                            
                            // 最後の不完全な文を保持
                            fullText = sentences.join('');
                        }
                        
                    } catch (e) {
                        console.error('❌ SSE parse error:', e, 'Line:', line);
                    }
                }
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Streaming failed:', error);
        return false;
    }
}

// 従来の非ストリーミングモード（フォールバック）
async function runTraditionalAttack() {
    try {
        const response = await fetch('/attack', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                system_state: systemState,
                active_modules: systemState.waitingModules,
                streaming: false  // ★ 非ストリーミング指定
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            addLog('error', `❌ ${data.log}`);
            return;
        }
        
        const steps = data.log.split('\n').filter(line => line.trim());
        
        for (let i = 0; i < steps.length; i++) {
            if (!systemState.vertexAIRunning || systemState.currentMode !== 'vertexai') {
                addLog('info', '⏹️ Vertex AI停止');
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const stepText = steps[i];
            addLog('read', `🤖 ${stepText}`);
            
            // ファイル名が含まれていたら頂点を光らせる
            const foundModuleIndex = systemState.allModules.findIndex(m => stepText.includes(m));
            if (foundModuleIndex !== -1) {
                activateVertex(foundModuleIndex % 7);
            }
            
            // エラー検知
            if (stepText.includes('Error') || stepText.includes('循環') || stepText.includes('ループ')) {
                systemState.stats.errors++;
            }
            systemState.stats.execution++;
            updateStats();
        }
        
    } catch (error) {
        addLog('error', `❌ Vertex AI接続エラー: ${error.message}`);
    }
}

// 思考ステップを表示する補助関数
async function displayThinkingStep(stepText, logType = 'read') {
    if (!systemState.vertexAIRunning || systemState.currentMode !== 'vertexai') {
        return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addLog(logType, stepText);
    
    // ファイル名検出 → 頂点を光らせる
    const foundModuleIndex = systemState.allModules.findIndex(m => 
        stepText.includes(m)
    );
    if (foundModuleIndex !== -1) {
        activateVertex(foundModuleIndex % 7);
        systemState.stats.fileAccess++;
    }
    
    // エラー検出
    const errorKeywords = ['Error', '循環', 'ループ', '失敗', 'エラー', 'RecursionError', 'ImportError'];
    if (errorKeywords.some(keyword => stepText.includes(keyword))) {
        systemState.stats.errors++;
    }
    
    systemState.stats.execution++;
    updateStats();
}
// ========================================
// 6. イベントリスナー（修正版）
// ========================================

// 物理キーファイル選択
document.getElementById('keyFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('verifyKeyBtn').disabled = false;
        document.getElementById('keyStatus').textContent = 
            `選択済み: ${file.name} - 検証ボタンを押してください`;
    }
});

// 物理キー検証
document.getElementById('verifyKeyBtn').addEventListener('click', function() {
    const file = document.getElementById('keyFileInput').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            let keyData;
            
            if (file.name.endsWith('.json')) {
                keyData = JSON.parse(content);
            } else {
                keyData = { content: content };
            }
            
            const isValid = keyData.signature === "MAGIC_SEAL_2025" ||
                           (keyData.content && keyData.content.includes('def unlock'));
            
            if (isValid) {
                systemState.keyVerified = true;
                document.getElementById('keyStatus').className = 'key-status verified';
                document.getElementById('keyStatus').textContent = 
                    '✅ 検証成功 - アクセス許可';
                addLog('read', '✅ 物理キー検証成功 - システム解除');
                
                stopSimulation();
                stopVertexAI();
                
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

// 攻撃シミュレーションボタン（修正版：画面は閉じない）
document.getElementById('toggleTacticalBtn').addEventListener('click', function() {
    const view = document.getElementById('tacticalView');
    
    if (systemState.currentMode === 'simulation') {
        // シミュレーション停止（画面は閉じない）
        stopSimulation();
        systemState.currentMode = null;
        this.textContent = '📊 攻撃シミュレーションを再開';
        document.getElementById('vertexAttackBtn').textContent = '🤖 Vertex AIに切り替え';
        addLog('info', '⏸️ シミュレーションモードを一時停止しました');
        
    } else {
        // シミュレーション開始
        view.classList.add('visible');
        stopVertexAI();  // 他のモードを停止
        
        systemState.currentMode = 'simulation';
        this.textContent = '📊 攻撃シミュレーションを停止';
        document.getElementById('vertexAttackBtn').textContent = '🤖 Vertex AIに切り替え';
        
        if (!systemState.startTime) {
            systemState.startTime = Date.now();
            setInterval(() => {
                if (!systemState.keyVerified) {
                    updateStats();
                }
            }, 1000);
        }
        
        addLog('info', '📊 攻撃シミュレーションモードに切り替わりました');
        simulateIntrusion();
    }
});

// Vertex AIボタン（修正版：画面は閉じない）
document.getElementById('vertexAttackBtn').addEventListener('click', async function() {
    const view = document.getElementById('tacticalView');
    
    if (systemState.currentMode === 'vertexai') {
        // Vertex AI停止（画面は閉じない！）
        stopVertexAI();
        systemState.currentMode = null;
        this.textContent = '🤖 Vertex AIを再開';
        document.getElementById('toggleTacticalBtn').textContent = '📊 シミュレーションに切り替え';
        addLog('info', '⏸️ Vertex AIモードを一時停止しました');
        
    } else {
        // Vertex AI開始
        view.classList.add('visible');
        stopSimulation();  // 他のモードを停止
        
        systemState.currentMode = 'vertexai';
        this.textContent = '🤖 Vertex AIを停止';
        document.getElementById('toggleTacticalBtn').textContent = '📊 シミュレーションに切り替え';
        
        if (!systemState.startTime) {
            systemState.startTime = Date.now();
            setInterval(() => {
                if (!systemState.keyVerified) {
                    updateStats();
                }
            }, 1000);
        }
        
        systemState.vertexAIRunning = true;
        addLog('info', '🤖 Vertex AIモードに切り替わりました');
        
        await runVertexAIAttack();
    }
});

// 戦術画面を閉じる（修正版：すべて停止して画面を閉じる）
document.getElementById('closeTacticalBtn').addEventListener('click', function() {
    stopSimulation();
    stopVertexAI();
    systemState.currentMode = null;
    
    document.getElementById('tacticalView').classList.remove('visible');
    document.getElementById('toggleTacticalBtn').textContent = '📊 攻撃シミュレーションを表示';
    document.getElementById('vertexAttackBtn').textContent = '🤖 Vertex AIで挑戦する';
    addLog('info', '⏸️ 戦術画面を閉じました');
});

// ========================================
// 7. 初期化
// ========================================
window.addEventListener('load', () => {
    drawHeptagram();
    shuffleWaitingModules();
});