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

function shuffleWaitingModules() {
    if (systemState.keyVerified) return;
    
    const shuffled = [...systemState.allModules].sort(() => Math.random() - 0.5);
    systemState.waitingModules = shuffled.slice(0, 3);
    updateWaitingModules();
}

function drawHeptagram() {
    const svg = document.getElementById('star-lines');
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
        label.style.left = `${vertex.x}px`;
        label.style.top = `${vertex.y}px`;
    });
}

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

function activateVertex(index) {
    document.querySelectorAll('.vertex-label').forEach(el => {
        el.classList.remove('active');
    });
    
    const vertex = document.getElementById(`vertex-${index}`);
    vertex.classList.add('active');
    systemState.currentVertex = index;
    
    const filename = vertex.textContent;
    addLog('read', `ファイル読み込み: ${filename}`);
    systemState.stats.fileAccess++;
    updateStats();
}

function updateStats() {
    document.getElementById('statFileAccess').textContent = systemState.stats.fileAccess;
    document.getElementById('statExecution').textContent = systemState.stats.execution;
    document.getElementById('statErrors').textContent = systemState.stats.errors;
    
    if (systemState.startTime) {
        const elapsed = Math.floor((Date.now() - systemState.startTime) / 1000);
        document.getElementById('statElapsed').textContent = `${elapsed}s`;
    }
}

function stopSimulation() {
    if (systemState.simulationInterval) {
        clearInterval(systemState.simulationInterval);
        systemState.simulationInterval = null;
    }
}

function stopVertexAI() {
    systemState.vertexAIRunning = false;
}

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
        
        const elapsed = (Date.now() - systemState.startTime) / 1000;
        if (elapsed > 300) {
            stopSimulation();
            triggerAlert();
        }
    }, 2000 + Math.random() * 2000);
}

function triggerAlert() {
    systemState.intrusionDetected = true;
    
    document.querySelectorAll('.module-card').forEach(card => {
        card.classList.add('alert');
    });
    
    addLog('error', '🚨 異常検知：5分以上の停滞を検出');
    addLog('error', '🚨 人間の介入が必要です');
}

document.getElementById('keyFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('verifyKeyBtn').disabled = false;
        document.getElementById('keyStatus').textContent = 
            `選択済み: ${file.name} - 検証ボタンを押してください`;
    }
});

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

document.getElementById('toggleTacticalBtn').addEventListener('click', function() {
    const view = document.getElementById('tacticalView');
    const isVisible = view.classList.contains('visible');
    
    if (!isVisible) {
        view.classList.add('visible');
        systemState.currentMode = 'simulation';
        this.textContent = '📊 攻撃シミュレーションを停止';
        
        if (!systemState.startTime) {
            systemState.startTime = Date.now();
            setInterval(() => {
                if (!systemState.keyVerified) {
                    updateStats();
                }
            }, 1000);
        }
        
        stopVertexAI();
        simulateIntrusion();
        
        document.getElementById('vertexAttackBtn').textContent = '🤖 Vertex AIに切り替え';
    } else if (systemState.currentMode === 'simulation') {
        stopSimulation();
        systemState.currentMode = null;
        this.textContent = '📊 攻撃シミュレーションを表示';
        view.classList.remove('visible');
        document.getElementById('vertexAttackBtn').textContent = '🤖 Vertex AIで挑戦する';
    } else {
        stopVertexAI();
        systemState.currentMode = 'simulation';
        this.textContent = '📊 攻撃シミュレーションを停止';
        document.getElementById('vertexAttackBtn').textContent = '🤖 Vertex AIに切り替え';
        
        simulateIntrusion();
    }
});

document.getElementById('closeTacticalBtn').addEventListener('click', function() {
    stopSimulation();
    stopVertexAI();
    systemState.currentMode = null;
    
    document.getElementById('tacticalView').classList.remove('visible');
    document.getElementById('toggleTacticalBtn').textContent = '📊 攻撃シミュレーションを表示';
    document.getElementById('vertexAttackBtn').textContent = '🤖 Vertex AIで挑戦する';
});

document.getElementById('vertexAttackBtn').addEventListener('click', async function() {
    const view = document.getElementById('tacticalView');
    const isVisible = view.classList.contains('visible');
    
    if (!isVisible) {
        view.classList.add('visible');
        systemState.currentMode = 'vertexai';
        this.textContent = '🤖 Vertex AIを停止';
        
        if (!systemState.startTime) {
            systemState.startTime = Date.now();
            setInterval(() => {
                if (!systemState.keyVerified) {
                    updateStats();
                }
            }, 1000);
        }
        
        stopSimulation();
        document.getElementById('toggleTacticalBtn').textContent = '📊 シミュレーションに切り替え';
        
        systemState.vertexAIRunning = true;
        addLog('exec', '🤖 Vertex AIが思考を開始...');
        
        try {
            const response = await fetch('/attack', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    system_state: systemState,
                    active_modules: systemState.waitingModules
                })
            });
            
            const data = await response.json();
            
            const steps = data.log.split('\n').filter(line => line.trim());
            for (let i = 0; i < steps.length; i++) {
                if (!systemState.vertexAIRunning || systemState.currentMode !== 'vertexai') break;

            await new Promise(resolve => setTimeout(resolve, 1500));
    
            const stepText = steps[i];
            addLog('read', `🤖 ${stepText}`);

    // 【追加】AIの言葉にファイル名が含まれていたら、七芒星の頂点を光らせる
            const foundModuleIndex = systemState.allModules.findIndex(m => stepText.includes(m));
            if (foundModuleIndex !== -1) {
                activateVertex(foundModuleIndex); // 七芒星を光らせる
                systemState.stats.fileAccess++;    // カウントアップ
                updateStats();                     // 画面の数字を更新
            }

    // 【追加】AIが「エラー」や「ループ」に言及したら統計を増やす
            if (stepText.includes('Error') || stepText.includes('循環') || stepText.includes('ループ')) {
               systemState.stats.errors++;
            }
            systemState.stats.execution++;
            updateStats(); // 画面の数字を更新
        }   
        
        } catch (error) {
            addLog('error', `❌ Vertex AI接続エラー: ${error.message}`);
        }
    } else if (systemState.currentMode === 'vertexai') {
        stopVertexAI();
        systemState.currentMode = null;
        this.textContent = '🤖 Vertex AIで挑戦する';
        view.classList.remove('visible');
        document.getElementById('toggleTacticalBtn').textContent = '📊 攻撃シミュレーションを表示';
    } else {
        stopSimulation();
        systemState.currentMode = 'vertexai';
        this.textContent = '🤖 Vertex AIを停止';
        document.getElementById('toggleTacticalBtn').textContent = '📊 シミュレーションに切り替え';
        
        systemState.vertexAIRunning = true;
        addLog('exec', '🤖 Vertex AIが思考を開始...');
        
        try {
            const response = await fetch('/attack', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    system_state: systemState,
                    active_modules: systemState.waitingModules
                })
            });
            
            const data = await response.json();
            
            const steps = data.log.split('\n').filter(line => line.trim());
            for (let i = 0; i < steps.length; i++) {
                if (!systemState.vertexAIRunning || systemState.currentMode !== 'vertexai') {
                    addLog('error', '❌ Vertex AI停止');
                    break;
                }
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                addLog('read', `🤖 ${steps[i]}`);
            }
            
        } catch (error) {
            addLog('error', `❌ Vertex AI接続エラー: ${error.message}`);
        }
    }
});

window.addEventListener('load', () => {
    drawHeptagram();
    shuffleWaitingModules();
});
