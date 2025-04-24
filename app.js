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

    // 資産成長シミュレーションチャート
    const assetGrowthCtx = document.getElementById('assetGrowthChart').getContext('2d');
    
    // 標準シナリオデータ
    const standardData = {
        labels: ['投資開始', '5年後', '10年後', '20年後', '30年後'],
        datasets: [{
            label: '資産価値',
            data: [10000, 12000, 15000, 22000, 30000],
            borderColor: '#87157a',
            backgroundColor: 'rgba(135, 21, 122, 0.1)',
            fill: true,
            tension: 0.3
        }, {
            label: 'ローン残高',
            data: [9700, 8200, 6500, 2100, 0],
            borderColor: '#5d5d5d',
            backgroundColor: 'rgba(93, 93, 93, 0.1)',
            fill: true,
            tension: 0.3
        }]
    };

    // 上昇シナリオデータ
    const growthData = {
        labels: ['投資開始', '5年後', '10年後', '20年後', '30年後'],
        datasets: [{
            label: '資産価値',
            data: [10000, 13500, 18000, 28000, 40000],
            borderColor: '#87157a',
            backgroundColor: 'rgba(135, 21, 122, 0.1)',
            fill: true,
            tension: 0.3
        }, {
            label: 'ローン残高',
            data: [9700, 8200, 6500, 2100, 0],
            borderColor: '#5d5d5d',
            backgroundColor: 'rgba(93, 93, 93, 0.1)',
            fill: true,
            tension: 0.3
        }]
    };

    // 保守シナリオデータ
    const conservativeData = {
        labels: ['投資開始', '5年後', '10年後', '20年後', '30年後'],
        datasets: [{
            label: '資産価値',
            data: [10000, 10500, 12000, 16000, 22000],
            borderColor: '#87157a',
            backgroundColor: 'rgba(135, 21, 122, 0.1)',
            fill: true,
            tension: 0.3
        }, {
            label: 'ローン残高',
            data: [9700, 8200, 6500, 2100, 0],
            borderColor: '#5d5d5d',
            backgroundColor: 'rgba(93, 93, 93, 0.1)',
            fill: true,
            tension: 0.3
        }]
    };

    // 資産成長チャート初期化
    const assetGrowthChart = new Chart(assetGrowthCtx, {
        type: 'line',
        data: standardData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value / 100 + '億円';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw / 100 + '億円';
                        }
                    }
                }
            }
        }
    });

    // シナリオ切り替えボタンイベント
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    scenarioButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            scenarioButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const scenario = this.getAttribute('data-scenario');
            
            if (scenario === 'standard') {
                assetGrowthChart.data = standardData;
            } else if (scenario === 'growth') {
                assetGrowthChart.data = growthData;
            } else if (scenario === 'conservative') {
                assetGrowthChart.data = conservativeData;
            }
            
            assetGrowthChart.update();
        });
    });

    // 「もっと見る」「閉じる」ボタン機能 - app.jsでも同様に変更が必要
    const toggleTextButtons = document.querySelectorAll('.toggle-text');
    toggleTextButtons.forEach(buttonContainer => {
        const moreButton = buttonContainer.querySelector('.read-more');
        const lessButton = buttonContainer.querySelector('.read-less');
        const textElement = buttonContainer.closest('.testimonial-content, .story-text-wrapper').querySelector('.testimonial-text, .story-text');
        
        // もっと見るボタンのクリックイベント
        moreButton.addEventListener('click', function() {
            textElement.classList.add('expanded');
            moreButton.style.display = 'none';
            lessButton.style.display = 'inline-block';
        });
        
        // 閉じるボタンのクリックイベント
        lessButton.addEventListener('click', function() {
            textElement.classList.remove('expanded');
            lessButton.style.display = 'none';
            moreButton.style.display = 'inline-block';
        });
    });
});