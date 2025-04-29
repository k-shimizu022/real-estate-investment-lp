document.addEventListener('DOMContentLoaded', function() {
    
    // 入居率チャート
    const occupancyCtx = document.getElementById('occupancyChart').getContext('2d');
    const occupancyChart = new Chart(occupancyCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            datasets: [
                {
                    label: 'Daimlar管理物件',
                    data: [97, 98, 98, 97, 98, 100, 99, 97, 98, 99, 98, 97],
                    borderColor: '#87157a',
                    backgroundColor: 'rgba(135, 21, 122, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: '業界平均',
                    data: [85, 83, 86, 85, 82, 84, 87, 86, 85, 84, 83, 82],
                    borderColor: '#5d5d5d',
                    backgroundColor: 'rgba(93, 93, 93, 0.1)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 80,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '%';
                        }
                    }
                }
            }
        }
    });

    // シナリオ詳細データ
    const scenarioDetails = {
        standard: {
            name: "標準シナリオ",
            interestRate: "8%",
            finalAssetValue: "5620万円",
            finalLoanBalance: "4383万円",
            totalProfit: "2740万円"
        },
        growth: {
            name: "上昇シナリオ",
            interestRate: "7%",
            finalAssetValue: "6428万円",
            finalLoanBalance: "4383万円",
            totalProfit: "3000万円"
        },
        conservative: {
            name: "保守シナリオ",
            interestRate: "保守的",
            finalAssetValue: "5000万円",
            finalLoanBalance: "4383万円",
            totalProfit: "2000万円"
        }
    };

    // 資産成長シミュレーションチャート初期化
    function initializeSimulationCharts() {
        // チャートのコンテキスト取得
        const assetLoanCtx = document.getElementById('assetLoanChart').getContext('2d');
        const cashflowCtx = document.getElementById('cashflowChart').getContext('2d');
        
        // 資産価値とローン残高のチャートオプション
        const assetLoanOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 4000,
                    max: 7000,
                    ticks: {
                        callback: function(value) {
                            return value + '万円';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '万円';
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        };
        
        // キャッシュフローチャートオプション
        const cashflowOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: -300,
                    max: 3500,
                    ticks: {
                        callback: function(value) {
                            return value + '万円';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '万円';
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        };
        
        // 資産価値とローン残高チャートの作成
        const assetLoanChart = new Chart(assetLoanCtx, {
            type: 'line',
            data: getAssetLoanData('standard'),
            options: assetLoanOptions
        });
        
        // キャッシュフローチャートの作成
        const cashflowChart = new Chart(cashflowCtx, {
            type: 'bar',
            data: getCashflowData('standard'),
            options: cashflowOptions
        });
        
        // シナリオ詳細を初期表示（標準シナリオ）
        updateScenarioDetails('standard');
        
        // シナリオ切り替えタブのイベント
        const scenarioTabs = document.querySelectorAll('.tab-item');
        scenarioTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                scenarioTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const scenario = this.getAttribute('data-scenario');
                
                // 両方のグラフのデータを更新
                assetLoanChart.data = getAssetLoanData(scenario);
                cashflowChart.data = getCashflowData(scenario);
                
                assetLoanChart.update();
                cashflowChart.update();
                
                // シナリオの詳細情報を更新
                updateScenarioDetails(scenario);
            });
        });
    }
    
    // シナリオ詳細を更新する関数
    function updateScenarioDetails(scenario) {
        const details = scenarioDetails[scenario];
        const detailsContainer = document.getElementById('scenario-details-container');
        
        if (!detailsContainer) return;
        
        // 詳細情報のタイトルを更新
        const detailsTitle = detailsContainer.querySelector('h4');
        if (detailsTitle) {
            detailsTitle.textContent = details.name + 'の詳細';
        }
        
        // 各項目の値を更新
        const detailItems = detailsContainer.querySelectorAll('.scenario-detail-item');
        detailItems.forEach(item => {
            const label = item.querySelector('.label').textContent.trim();
            const valueElement = item.querySelector('.value');
            
            if (label === '利回り') {
                valueElement.textContent = details.interestRate;
            } else if (label === '10年後の資産価値') {
                valueElement.textContent = details.finalAssetValue;
            } else if (label === '10年後のローン残高') {
                valueElement.textContent = details.finalLoanBalance;
            } else if (label === '総収益') {
                valueElement.textContent = details.totalProfit;
            }
        });
    }
    
    // 資産価値とローン残高のデータセット取得
    function getAssetLoanData(scenario) {
        const data = {
            labels: ['投資開始', '2年後', '4年後', '6年後', '8年後', '10年後'],
            datasets: []
        };
        
        if (scenario === 'standard') {
            data.datasets = [
                {
                    label: '資産価値',
                    data: [6000, 5900, 5840, 5780, 5700, 5620],
                    borderColor: '#ff69b4',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'ローン残高',
                    data: [6000, 5500, 5300, 5000, 4700, 4383],
                    borderColor: '#ff69b4',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.3
                }
            ];
        } else if (scenario === 'growth') {
            data.datasets = [
                {
                    label: '資産価値',
                    data: [6000, 6100, 6160, 6220, 6320, 6428],
                    borderColor: '#ff69b4',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'ローン残高',
                    data: [6000, 5500, 5300, 5000, 4700, 4383],
                    borderColor: '#ff69b4',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.3
                }
            ];
        } else if (scenario === 'conservative') {
            data.datasets = [
                {
                    label: '資産価値',
                    data: [6000, 5800, 5650, 5500, 5250, 5000],
                    borderColor: '#ff69b4',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'ローン残高',
                    data: [6000, 5500, 5300, 5000, 4700, 4383],
                    borderColor: '#ff69b4',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.3
                }
            ];
        }
        
        return data;
    }
    
    // キャッシュフローのデータセット取得
    function getCashflowData(scenario) {
        const data = {
            labels: ['投資開始', '2年後', '4年後', '6年後', '8年後', '10年後'],
            datasets: []
        };
        
        if (scenario === 'standard') {
            data.datasets = [
                {
                    label: '初期投資',
                    data: [-300, 0, 0, 0, 0, 0],
                    backgroundColor: '#E53935',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '年間キャッシュフロー',
                    data: [0, 180, 180, 180, 180, 180],
                    backgroundColor: '#4CAF50',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '売却益',
                    data: [0, 0, 0, 0, 0, 1600],
                    backgroundColor: '#FF9800',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '累積キャッシュフロー',
                    data: [-300, 60, 420, 780, 1140, 3100],
                    type: 'line',
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    fill: false,
                    tension: 0.3,
                    order: -1
                }
            ];
        } else if (scenario === 'growth') {
            data.datasets = [
                {
                    label: '初期投資',
                    data: [-300, 0, 0, 0, 0, 0],
                    backgroundColor: '#E53935',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '年間キャッシュフロー',
                    data: [0, 180, 180, 180, 180, 180],
                    backgroundColor: '#4CAF50',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '売却益',
                    data: [0, 0, 0, 0, 0, 1860],
                    backgroundColor: '#FF9800',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '累積キャッシュフロー',
                    data: [-300, 60, 420, 780, 1140, 3360],
                    type: 'line',
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    fill: false,
                    tension: 0.3,
                    order: -1
                }
            ];
        } else if (scenario === 'conservative') {
            data.datasets = [
                {
                    label: '初期投資',
                    data: [-300, 0, 0, 0, 0, 0],
                    backgroundColor: '#E53935',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '年間キャッシュフロー',
                    data: [0, 180, 180, 180, 180, 180],
                    backgroundColor: '#4CAF50',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '売却益',
                    data: [0, 0, 0, 0, 0, 860],
                    backgroundColor: '#FF9800',
                    stack: 'stack1',
                    order: 1
                },
                {
                    label: '累積キャッシュフロー',
                    data: [-300, 60, 420, 780, 1140, 2360],
                    type: 'line',
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    fill: false,
                    tension: 0.3,
                    order: -1
                }
            ];
        }
        
        return data;
    }

    // チャート初期化を呼び出し
    if (document.getElementById('assetLoanChart') && document.getElementById('cashflowChart')) {
        initializeSimulationCharts();
    }

    // 「もっと見る」「閉じる」ボタン機能
    const toggleTextButtons = document.querySelectorAll('.toggle-text');
    toggleTextButtons.forEach(buttonContainer => {
        const moreButton = buttonContainer.querySelector('.read-more');
        const lessButton = buttonContainer.querySelector('.read-less');
        const textElement = buttonContainer.closest('.testimonial-content, .story-text-wrapper').querySelector('.testimonial-text, .story-text');
        
        // もっと見るボタンのクリックイベント
        if (moreButton) {
            moreButton.addEventListener('click', function() {
                textElement.classList.add('expanded');
                moreButton.style.display = 'none';
                lessButton.style.display = 'inline-block';
            });
        }
        
        // 閉じるボタンのクリックイベント
        if (lessButton) {
            lessButton.addEventListener('click', function() {
                textElement.classList.remove('expanded');
                lessButton.style.display = 'none';
                moreButton.style.display = 'inline-block';
            });
        }
    });
});