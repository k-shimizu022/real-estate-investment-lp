// --- START OF SCRIPT ---
document.addEventListener('DOMContentLoaded', () => { // DOM読み込み後に実行

    // --- チャット関連要素 ---
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatContainer = document.getElementById('chat-container');
    const openChatBtns = document.querySelectorAll('.open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    // --- ダイアログ関連要素 ---
    const successDialogOverlay = document.getElementById('success-dialog-overlay');
    const successDialogMessage = document.getElementById('success-dialog-message');
    const successDialogCloseBtn = document.getElementById('success-dialog-close-btn');

    // --- 要素存在チェック ---
    if (!chatMessagesContainer || !chatContainer || !closeChatBtn || openChatBtns.length === 0 || !successDialogOverlay || !successDialogMessage || !successDialogCloseBtn) {
        console.error('チャットまたはダイアログに必要なHTML要素が見つかりません。IDやクラス名を確認してください。');
        return;
    }

    // --- グローバル変数 ---
    const userAnswers = {};
    let currentQuestionIndex = 0;
    let isChatInitialized = false;

    // --- チャットフロー定義 ---
    const chatFlow = [
        {id: 'experience', questionText: '不動産投資の経験', question: "ダイムラーに興味を持ってくださりありがとうございます！\n\nはじめに、1分程度のカンタンな質問をさせてください。\n\nまず、不動産投資の経験はありますか？", options: ["あり", "なし"] },
        { id: 'purpose', questionText: '不動産投資の目的', question: "続いて、不動産投資の目的を教えてください。", options: ["老後の年金対策", "生命保険代わり", "リスク分散", "家賃収入", "老後の住まい", "相続対策", "節税", "投機目的", "その他・まだ決めていない"] },
        { id: 'interest', questionText: '不動産投資への興味度合い', question: "不動産投資への興味度合いはいかがでしょうか？", options: ["すぐ始めたい", "まずは話を聞いてみたい", "少し興味がある"] },
        { id: 'status', questionText: '現在の検討状況', question: "現在の検討状況も教えてください。", options: ["物件を選定している", "面談・セミナーも受けている", "資料を請求している", "情報を集めている", "特に何もしていない"] },
        { id: 'occupation', questionText: 'ご職業', question: (answers) => `${answers.status || '回答'}、ですね！次に、ご職業を教えてください。`, options: ["会社員（上場企業）", "会社員（その他）", "公務員", "医師", "経営者・役員", "自営業・その他", "士業（弁護士、税理士など）"] },
        { id: 'income', questionText: '現在の年収', question: "ありがとうございます！続いて、現在の年収を教えてください。", options: ["400万未満", "400万～", "500万～", "600万～", "700万～", "800万～", "1000万～", "1500万～", "2000万～", "3000万～", "5000万～"] },
        { id: 'years_of_service', questionText: '勤続年数', question: "勤続年数は何年でしょうか？", options: ["1年未満", "1年以上"] },
        { id: 'assets', questionText: '保有金融資産', question: "ありがとうございます！次に保有している金融資産の総額を教えてください。", options: ["100万未満", "100万～", "500万～", "1000万～", "2000万～", "3000万～", "5000万～", "1億円～"] },
        { id: 'gender', questionText: '性別', question: "性別を選択してください。", options: ["男性", "女性", "無回答"] },
        { id: 'prefecture', questionText: 'お住まいの都道府県', question: "お住まいの都道府県を選択してください。", options: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]},
        { id: 'birthdate', questionText: '生年月日', question: "生年月日を西暦でご入力ください。", inputType: 'birthdate-group'},
        { id: 'name-kana', questionText: 'お名前・ふりがな', question: "お名前とふりがなをそれぞれご入力ください。", inputType: 'name-kana-group'},
        { id: 'phone', questionText: 'お電話番号', question: "ご連絡先のお電話番号をお願いします。", inputType: 'tel'},
        { id: 'email', questionText: 'メールアドレス', question: "メールアドレスもお願いします。", inputType: 'email'},
        { id: 'summary', type: 'summary', questionText: '入力内容のご確認'}
    ];

    // --- Helper Functions ---

    /**
     * 要素を指定された参照要素の後、またはコンテナの末尾に追加/挿入する（スクロールは行わない）
     * @param {HTMLElement} element 追加/挿入する要素
     * @param {HTMLElement} [referenceElement=null] この要素の直後に挿入する (nullなら末尾に追加)
     */
    function addElementToChat(element, referenceElement = null) {
        if (referenceElement && referenceElement.parentNode === chatMessagesContainer) {
            try {
                 referenceElement.insertAdjacentElement('afterend', element);
            } catch (error) {
                console.error("Error inserting element:", error, "Appending instead.");
                 chatMessagesContainer.appendChild(element);
            }
        } else {
            chatMessagesContainer.appendChild(element);
        }
    }

    // 選択肢ボタンのコンテナを作成する
    function createOptionsContainer(step, index) {
        if (step.inputType || !step.options || step.options.length === 0) return null;
        const container = document.createElement('div');
        container.classList.add('options-container');
        container.setAttribute('data-question-index', index);
        step.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.addEventListener('click', () => handleOptionClick(option, index));
            container.appendChild(button);
        });
        return container;
    }

    // エラー表示/クリア用ヘルパー
    function displayError(targetElement, message) {
        let errorElement = targetElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            // text や textarea のラッパーにエラーを追加するように変更
            if (targetElement.classList.contains('input-wrapper') ||
                targetElement.classList.contains('birthdate-field-wrapper') ||
                targetElement.classList.contains('input-field-container')) {
                targetElement.appendChild(errorElement);
            } else if (targetElement.classList.contains('birthdate-group')) {
                // 生年月日グループ全体のエラーは、決定ボタンの前に挿入する
                const submitBtn = targetElement.querySelector('.submit-input-btn');
                if(submitBtn) {
                     targetElement.insertBefore(errorElement, submitBtn);
                } else {
                    targetElement.appendChild(errorElement); // 予備
                }
                errorElement.classList.add('group-error'); // スタイル用クラス
            }
             else {
                targetElement.appendChild(errorElement);
            }
        }
        errorElement.textContent = message;
    }
    function clearError(targetElement) {
        const errorElement = targetElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
        // グループエラーもクリア
        const groupError = targetElement.querySelector('.group-error');
         if (groupError) {
             groupError.textContent = '';
         }
    }

    // 生年月日入力グループのコンテナを作成
    function createBirthdateContainer(step, index) {
        if (step.inputType !== 'birthdate-group') return null;

        const container = document.createElement('div');
        container.classList.add('input-container', 'birthdate-group');
        container.setAttribute('data-question-index', index);

        const fields = [
            { idSuffix: 'Year', label: '年', maxLength: 4, pattern: "\\d{4}", example: '例: 1990' },
            { idSuffix: 'Month', label: '月', maxLength: 2, pattern: "\\d{2}", example: '例: 03' },
            { idSuffix: 'Day', label: '日', maxLength: 2, pattern: "\\d{2}", example: '例: 05' }
        ];
        const inputElements = {};

        fields.forEach((field, fieldIndex) => {
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'birthdate-field-wrapper';
            const fieldRow = document.createElement('span');
            fieldRow.className = 'birthdate-field-row';

            const input = document.createElement('input');
            input.type = 'tel'; // type="number" は スタイルや挙動に制限があるため tel を使用
            input.inputMode = 'numeric'; // モバイルでの数値キーボード表示
            input.pattern = field.pattern;
            input.maxLength = field.maxLength;
            input.id = `input-${step.id}-${field.idSuffix}`;
            input.required = true;
            inputElements[field.idSuffix] = input;

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = field.label;

            fieldRow.appendChild(input);
            fieldRow.appendChild(label);

            const exampleText = document.createElement('small');
            exampleText.className = 'birthdate-example';
            exampleText.textContent = field.example;

            // グループ全体のエラークリア
            input.addEventListener('input', () => {
                clearError(container);
                clearError(inputWrapper); // 個別フィールドのエラーもクリア
            });

            if (fieldIndex < fields.length - 1) {
                input.addEventListener('input', (e) => {
                    if (e.target.value.length >= field.maxLength) {
                        const nextFieldSuffix = fields[fieldIndex + 1].idSuffix;
                        inputElements[nextFieldSuffix]?.focus();
                    }
                });
            }

            inputWrapper.appendChild(fieldRow);
            inputWrapper.appendChild(exampleText);
            container.appendChild(inputWrapper);
        });

        const submitButton = document.createElement('button');
        submitButton.textContent = '決定';
        submitButton.classList.add('submit-input-btn');

        // グループ全体用のエラーメッセージ領域（ボタンの前に追加）
        const groupErrorSpan = document.createElement('span');
        groupErrorSpan.className = 'error-message group-error';
        groupErrorSpan.id = `error-${step.id}-group`;
        container.appendChild(groupErrorSpan); // 先に追加しておく

        submitButton.addEventListener('click', () => {
            let isValid = true;
            clearError(container); // グループエラーをクリア

            const year = inputElements['Year'].value;
            const month = inputElements['Month'].value;
            const day = inputElements['Day'].value;
            const yearWrapper = inputElements['Year'].closest('.birthdate-field-wrapper');
            const monthWrapper = inputElements['Month'].closest('.birthdate-field-wrapper');
            const dayWrapper = inputElements['Day'].closest('.birthdate-field-wrapper');
            clearError(yearWrapper);
            clearError(monthWrapper);
            clearError(dayWrapper);

            if (!year.match(/^\d{4}$/)) { isValid = false; displayError(yearWrapper, '4桁で入力'); }
            if (!month.match(/^\d{1,2}$/) || parseInt(month) < 1 || parseInt(month) > 12) { isValid = false; displayError(monthWrapper, '1-12'); }
            if (!day.match(/^\d{1,2}$/) || parseInt(day) < 1 || parseInt(day) > 31) { isValid = false; displayError(dayWrapper, '1-31'); }

            // 日付の妥当性チェック (任意だが推奨)
            if(isValid) {
                const date = new Date(year, month - 1, day);
                if (date.getFullYear() !== parseInt(year) || date.getMonth() !== parseInt(month) - 1 || date.getDate() !== parseInt(day)) {
                    isValid = false;
                    displayError(container, '有効な日付を入力してください。'); // グループエラーとして表示
                }
            }

            if (isValid) {
                // 月と日を2桁ゼロ埋めする
                const paddedMonth = month.padStart(2, '0');
                const paddedDay = day.padStart(2, '0');
                userAnswers[`${step.id}Year`] = year;
                userAnswers[`${step.id}Month`] = paddedMonth;
                userAnswers[`${step.id}Day`] = paddedDay;
                handleBirthdateInput(index);
            } else if (container.querySelector('.group-error').textContent === '') {
                // 個別エラーがあるがグループエラーがない場合、汎用メッセージを表示
                displayError(container, '生年月日を正しく入力してください。');
            }
        });

        container.appendChild(submitButton);
        return container;
    }

    // 氏名・ふりがな入力グループのコンテナを作成
    function createNameKanaContainer(step, index) {
        if (step.inputType !== 'name-kana-group') return null;

        const container = document.createElement('div');
        container.classList.add('input-container', 'name-kana-group');
        container.setAttribute('data-question-index', index);

        const fields = [
            { id: 'name', label: 'お名前', placeholder: '例：山田太郎', pattern: "^[^ -~｡-ﾟ]+$", title: '全角で入力してください（記号・半角不可）', errorId: `error-input-name` }, // 半角スペースも不可に
            { id: 'kana', label: 'ふりがな', placeholder: '例：やまだたろう', pattern: "^[ぁ-んー\\u3000]+$", title: '全角ひらがなで入力してください', errorId: `error-input-kana` }
        ];
        const inputElements = {};

        fields.forEach(field => {
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'input-field-container';

            const label = document.createElement('label');
            label.htmlFor = `input-${field.id}`;
            label.textContent = field.label;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `input-${field.id}`;
            input.placeholder = field.placeholder;
            if (field.pattern) { input.pattern = field.pattern; input.title = field.title; }
            input.required = true;
            inputElements[field.id] = input;

            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.id = field.errorId;

            input.addEventListener('input', () => clearError(fieldContainer));

            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            fieldContainer.appendChild(errorSpan);
            container.appendChild(fieldContainer);
        });

        const submitButton = document.createElement('button');
        submitButton.textContent = '決定';
        submitButton.classList.add('submit-input-btn');

        submitButton.addEventListener('click', () => {
            let isValid = true;
            const nameInput = inputElements['name'];
            const kanaInput = inputElements['kana'];
            const nameContainer = nameInput.parentNode;
            const kanaContainer = kanaInput.parentNode;
            clearError(nameContainer);
            clearError(kanaContainer);

            const nameValue = nameInput.value;
            const kanaValue = kanaInput.value;
            const nameTrimmed = nameValue.trim();
            const kanaTrimmed = kanaValue.trim();

            if (nameTrimmed === '') { displayError(nameContainer, 'お名前を入力してください。'); isValid = false; }
             // 全角チェックを強化（半角スペースや記号を許容しない）
            else if (nameInput.pattern && !new RegExp(nameInput.pattern).test(nameValue)) { displayError(nameContainer, nameInput.title); isValid = false; }

            if (kanaTrimmed === '') { displayError(kanaContainer, 'ふりがなを入力してください。'); isValid = false; }
            else if (kanaInput.pattern && !new RegExp(kanaInput.pattern).test(kanaValue)) { displayError(kanaContainer, kanaInput.title); isValid = false; }

            if (isValid) {
                userAnswers['name'] = nameTrimmed;
                userAnswers['kana'] = kanaTrimmed;
                handleNameKanaInput(index);
            }
        });

        container.appendChild(submitButton);
        return container;
    }

    // 汎用的な入力コンテナを作成する
    function createGenericInputContainer(step, index) {
         if (!step.inputType || ['select', 'birthdate-group', 'name-kana-group'].includes(step.inputType)) return null;

        const container = document.createElement('div');
        container.classList.add('input-container');
        const inputWrapper = document.createElement('div');
        inputWrapper.classList.add('input-wrapper');
        container.setAttribute('data-question-index', index);

        let inputElement;
        if (step.inputType === 'textarea') {
            inputElement = document.createElement('textarea');
            inputElement.rows = 3;
        } else {
            inputElement = document.createElement('input');
            inputElement.type = step.inputType;
        }
        inputElement.id = `input-${step.id}`;
        inputElement.placeholder = step.placeholder || '';
        inputElement.required = step.required !== false;

        // 電話番号には inputmode="tel" を追加
        if (step.inputType === 'tel') {
            inputElement.inputMode = 'tel';
        }
        // メールには inputmode="email" を追加
        if (step.inputType === 'email') {
            inputElement.inputMode = 'email';
        }

        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.id = `error-${inputElement.id}`;

        inputElement.addEventListener('input', () => clearError(inputWrapper));

        inputWrapper.appendChild(inputElement);
        inputWrapper.appendChild(errorSpan);

        const submitButton = document.createElement('button');
        submitButton.textContent = '決定';
        submitButton.classList.add('submit-input-btn');
        submitButton.addEventListener('click', () => {
            clearError(inputWrapper);
            const value = inputElement.value;
            const trimmedValue = value.trim();
            let isValid = true;

            if (inputElement.required && trimmedValue === '') {
                 displayError(inputWrapper, '入力してください。'); isValid = false;
            }
             // Email validation (simple)
            else if (inputElement.type === 'email' && trimmedValue !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                 displayError(inputWrapper, '有効なメールアドレスを入力してください。'); isValid = false;
            }
             // Phone validation (digits and hyphens)
             else if (inputElement.type === 'tel' && trimmedValue !== '' && !/^[0-9\-]+$/.test(value)) {
                  displayError(inputWrapper, '有効な電話番号を入力してください (数字とハイフンのみ)。'); isValid = false;
             }

            if (isValid) {
                 handleTextInput(trimmedValue, index); // Trimmed value を渡す
            }
        });

         if (step.inputType !== 'textarea') {
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submitButton.click();
                }
            });
        }

        container.appendChild(inputWrapper);
        container.appendChild(submitButton);
        return container;
    }

    // --- Main Logic Functions ---

    /**
     * 指定されたインデックスの質問と入力要素を表示または再表示する
     * 新規質問追加時には、その質問までスムーズスクロールする
     * @param {number} index 表示する質問のインデックス
     */
    function displayQuestion(index) {
        if (index >= chatFlow.length) return;

        if (chatFlow[index].type === 'summary') {
            let firstUnansweredIndex = -1;
            for(let i=0; i < index; i++) {
                const step = chatFlow[i];
                // summaryタイプ自体はスキップ
                if (step.type === 'summary') continue;
                // requiredでない項目はチェック不要（ただし、必須でない=未入力OKなので、実際には未入力でも進む）
                // if(step.required === false) continue;

                let answered = false;
                if (step.inputType === 'birthdate-group') answered = userAnswers.hasOwnProperty(`${step.id}Year`);
                else if (step.inputType === 'name-kana-group') answered = userAnswers.hasOwnProperty('name');
                else if (step.id) answered = userAnswers.hasOwnProperty(step.id);

                // 必須項目が未回答の場合 (便宜上、全項目を必須扱いとしてチェック)
                if (!answered) {
                    firstUnansweredIndex = i;
                    break;
                }
            }
            if (firstUnansweredIndex !== -1) {
                 console.warn(`未回答の質問があります (インデックス: ${firstUnansweredIndex})。該当質問を表示します。`);
                 currentQuestionIndex = firstUnansweredIndex;
                 displayQuestion(currentQuestionIndex);
                 return;
            }
            displaySummary();
            return;
        }

        const currentStep = chatFlow[index];
        const questionIndex = index;

        let botMessageElement = chatMessagesContainer.querySelector(`.bot-message[data-question-index="${questionIndex}"]`);

        if (!botMessageElement) {
            botMessageElement = document.createElement('div');
            botMessageElement.classList.add('message', 'bot-message');
            const questionText = typeof currentStep.question === 'function'
                ? currentStep.question(userAnswers)
                : currentStep.question;
            botMessageElement.textContent = questionText || '';
            botMessageElement.setAttribute('data-question-index', questionIndex);
            addElementToChat(botMessageElement);

            setTimeout(() => {
                botMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }

        // 古い入力要素・回答・やり直しボタンの削除
        let nextElement = botMessageElement.nextElementSibling;
        while (nextElement) {
            const nextElementIndex = nextElement.getAttribute('data-question-index');
            if (nextElementIndex === String(questionIndex)) {
                 const elementToRemove = nextElement;
                 nextElement = nextElement.nextElementSibling;
                 elementToRemove.remove();
            } else {
                 break;
            }
        }

        // 新しい入力要素の生成と挿入
        const optionsContainer = createOptionsContainer(currentStep, questionIndex);
        const birthdateContainer = createBirthdateContainer(currentStep, questionIndex);
        const nameKanaContainer = createNameKanaContainer(currentStep, questionIndex);
        const genericInputContainer = createGenericInputContainer(currentStep, questionIndex);

        let inputElementToInsert = null;
        if (optionsContainer) inputElementToInsert = optionsContainer;
        else if (birthdateContainer) inputElementToInsert = birthdateContainer;
        else if (nameKanaContainer) inputElementToInsert = nameKanaContainer;
        else if (genericInputContainer) inputElementToInsert = genericInputContainer;

        if (inputElementToInsert) {
            addElementToChat(inputElementToInsert, botMessageElement);
        }
    }

    // --- ハンドラー関数 ---
    function handleOptionClick(option, questionIndex) {
        const optionsToRemove = chatMessagesContainer.querySelector(`.options-container[data-question-index="${questionIndex}"]`);
        if (optionsToRemove) optionsToRemove.remove();
        addUserMessageAndProceed(option, questionIndex);
    }
    function handleTextInput(inputValue, questionIndex) {
        const inputToRemove = chatMessagesContainer.querySelector(`.input-container[data-question-index="${questionIndex}"]`);
        if (inputToRemove) inputToRemove.remove();
        addUserMessageAndProceed(inputValue, questionIndex);
    }
    function handleBirthdateInput(questionIndex) {
        const inputToRemove = chatMessagesContainer.querySelector(`.input-container[data-question-index="${questionIndex}"]`);
        if (inputToRemove) inputToRemove.remove();
        const combinedValue = `${userAnswers.birthdateYear || ''}年${userAnswers.birthdateMonth || ''}月${userAnswers.birthdateDay || ''}日`;
        addUserMessageAndProceed(combinedValue, questionIndex, true);
    }
    function handleNameKanaInput(questionIndex) {
        const inputToRemove = chatMessagesContainer.querySelector(`.input-container[data-question-index="${questionIndex}"]`);
        if (inputToRemove) inputToRemove.remove();
        const combinedValue = `名前: ${userAnswers.name || ''}\nふりがな: ${userAnswers.kana || ''}`;
        addUserMessageAndProceed(combinedValue, questionIndex, true);
    }

    /**
     * ユーザーメッセージを追加し、やり直しボタンを表示し、次の未回答質問へ進む
     * @param {string} value 表示するユーザーの回答値
     * @param {number} questionIndex 回答した質問のインデックス
     * @param {boolean} isGroupInput グループ入力からの呼び出しかどうか
     */
    function addUserMessageAndProceed(value, questionIndex, isGroupInput = false) {
        const botMessageElement = chatMessagesContainer.querySelector(`.bot-message[data-question-index="${questionIndex}"]`);
        if (!botMessageElement) {
            console.error(`addUserMessageAndProceed: Bot message for index ${questionIndex} not found.`);
            return;
        }

        // 既存のユーザーメッセージとやり直しボタンを確実に削除
        const oldUserMsg = chatMessagesContainer.querySelector(`.user-message[data-question-index="${questionIndex}"]`);
        const oldRedoBtn = chatMessagesContainer.querySelector(`.redo-button[data-question-index="${questionIndex}"]`);
        if(oldUserMsg) oldUserMsg.remove();
        if(oldRedoBtn) oldRedoBtn.remove();

        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('message', 'user-message');
        userMessageElement.style.whiteSpace = 'pre-wrap';
        userMessageElement.textContent = value;
        userMessageElement.setAttribute('data-question-index', questionIndex);
        addElementToChat(userMessageElement, botMessageElement);

        // グループ入力でない場合のみ、直接 userAnswers に格納
        if (!isGroupInput) {
             const currentStep = chatFlow[questionIndex];
             if (currentStep && currentStep.id) userAnswers[currentStep.id] = value;
        }
         // 生年月日と氏名・かなは、それぞれのハンドラー関数内で userAnswers に格納済み

        // やり直しボタンを追加 (最終確認画面の前まで)
        const nextStepIndex = questionIndex + 1;
        if (nextStepIndex < chatFlow.length && chatFlow[nextStepIndex].type !== 'summary') {
             if (!chatMessagesContainer.querySelector(`.redo-button[data-question-index="${questionIndex}"]`)) {
                 const redoButton = document.createElement('button');
                 redoButton.classList.add('redo-button');
                 redoButton.textContent = '回答をやり直す';
                 redoButton.setAttribute('data-question-index', questionIndex);
                 redoButton.addEventListener('click', () => handleRedoClick(questionIndex));
                 addElementToChat(redoButton, userMessageElement);
             }
        }

        // 次の質問へ進むロジック（回答済みスキップ）
        let nextQuestionIndex = questionIndex + 1;
        while (nextQuestionIndex < chatFlow.length) {
            const step = chatFlow[nextQuestionIndex];
             if (step.type === 'summary') break; // Summaryまで来たらループ抜ける

            let answered = false;
            if (step.inputType === 'birthdate-group') answered = userAnswers.hasOwnProperty(`${step.id}Year`);
            else if (step.inputType === 'name-kana-group') answered = userAnswers.hasOwnProperty('name');
            else if (step.id) answered = userAnswers.hasOwnProperty(step.id);

            // 回答済みの場合は次へ
            if (answered) {
                 nextQuestionIndex++;
            } else {
                break; // 未回答が見つかったらそのインデックスで停止
            }
        }

        currentQuestionIndex = nextQuestionIndex;
        displayQuestion(currentQuestionIndex);
    }


    // 「回答をやり直す」ボタンの処理
    function handleRedoClick(questionIndexToRedo) {
        console.log(`Redoing question index: ${questionIndexToRedo}`);
        // 該当インデックスのユーザーメッセージとやり直しボタンを削除
        const userMessageToRemove = chatMessagesContainer.querySelector(`.user-message[data-question-index="${questionIndexToRedo}"]`);
        const redoButtonToRemove = chatMessagesContainer.querySelector(`.redo-button[data-question-index="${questionIndexToRedo}"]`);
        if(userMessageToRemove) userMessageToRemove.remove();
        if(redoButtonToRemove) redoButtonToRemove.remove();

        // 該当インデックスの回答を userAnswers から削除
        const stepToRedo = chatFlow[questionIndexToRedo];
        if (stepToRedo) {
             if (stepToRedo.inputType === 'birthdate-group') {
                 delete userAnswers[`${stepToRedo.id}Year`];
                 delete userAnswers[`${stepToRedo.id}Month`];
                 delete userAnswers[`${stepToRedo.id}Day`];
             } else if (stepToRedo.inputType === 'name-kana-group') {
                 delete userAnswers['name'];
                 delete userAnswers['kana'];
             } else if (stepToRedo.id && userAnswers.hasOwnProperty(stepToRedo.id)) {
                 delete userAnswers[stepToRedo.id];
             }
        }
         console.log('Answers after redo:', userAnswers);

        // 該当の質問の入力要素を再表示する
        displayQuestion(questionIndexToRedo);
    }

    // 確認画面を表示する
    function displaySummary() {
        const existingSummaryElements = chatMessagesContainer.querySelectorAll(
            '.summary-container, #summary-thankyou, #summary-instruction'
        );
        existingSummaryElements.forEach(el => el.remove());

        const summaryStep = chatFlow.find(step => step.type === 'summary');
        if (!summaryStep) return;

        const summaryContainer = document.createElement('div');
        summaryContainer.classList.add('summary-container');

        const thankYouMsg = document.createElement('div');
        thankYouMsg.id = 'summary-thankyou';
        thankYouMsg.classList.add('message', 'bot-message');
        thankYouMsg.textContent = 'ご回答ありがとうございました。';
        addElementToChat(thankYouMsg);

        const confirmationInstruction = document.createElement('div');
        confirmationInstruction.id = 'summary-instruction';
        confirmationInstruction.classList.add('message', 'bot-message');
        confirmationInstruction.textContent = '入力内容・利用規約等をご確認の上、「同意して送信」を押してください。';
        addElementToChat(confirmationInstruction);

        const titleElement = document.createElement('h3');
        titleElement.classList.add('summary-title');
        titleElement.textContent = summaryStep.questionText || '入力内容のご確認';
        summaryContainer.appendChild(titleElement);

        // chatFlow を使って定義された順序で表示
        for (const step of chatFlow) {
             if (!step.id || step.type === 'summary') continue; // IDがない、またはsummaryタイプはスキップ

             let displayValue = null;
             let displayLabel = step.questionText ? step.questionText.replace(/：$/, '') : step.id;

             if (step.inputType === 'birthdate-group') {
                 if (userAnswers[`${step.id}Year`]) {
                     displayValue = `${userAnswers[`${step.id}Year`]}年${userAnswers[`${step.id}Month`]}月${userAnswers[`${step.id}Day`]}日`;
                 }
             } else if (step.inputType === 'name-kana-group') {
                 if (userAnswers['name']) {
                      // 名前とかなを別々の項目として表示
                      const nameItem = document.createElement('div');
                      nameItem.classList.add('summary-item');
                      nameItem.innerHTML = `<strong>お名前</strong> <span class="summary-answer-value">${userAnswers['name']}</span>`;
                      summaryContainer.appendChild(nameItem);

                      const kanaItem = document.createElement('div');
                      kanaItem.classList.add('summary-item');
                      kanaItem.innerHTML = `<strong>ふりがな</strong> <span class="summary-answer-value">${userAnswers['kana']}</span>`;
                      summaryContainer.appendChild(kanaItem);
                      continue; // ループの残りはスキップ
                 }
             } else if (userAnswers.hasOwnProperty(step.id)) {
                 displayValue = userAnswers[step.id];
             }

            // displayValue が null でなく、空文字列でもない場合のみ表示
            if (displayValue !== null && String(displayValue).trim() !== '') {
                const item = document.createElement('div');
                item.classList.add('summary-item');
                const valueSpan = document.createElement('span');
                valueSpan.className = 'summary-answer-value';
                valueSpan.style.whiteSpace = 'pre-wrap'; // 改行を反映させる
                valueSpan.textContent = displayValue;
                item.innerHTML = `<strong>${displayLabel}</strong> `;
                item.appendChild(valueSpan);
                summaryContainer.appendChild(item);
            }
        }

        const linksDiv = document.createElement('div');
        linksDiv.classList.add('policy-links');
        // ★★★ リンク先を実際のパスに修正してください ★★★
        linksDiv.innerHTML = `
            <a href="terms/terms.html#terms" target="_blank">利用規約</a>
            <a href="terms/terms.html#privacy" target="_blank">プライバシーポリシー</a>
            <a href="terms/terms.html#handling" target="_blank">個人情報のお取扱いについて</a>
        `;
        summaryContainer.appendChild(linksDiv);

        const submitButton = document.createElement('button');
        submitButton.id = 'final-submit-btn';
        submitButton.textContent = '同意して送信';
        submitButton.addEventListener('click', handleFinalSubmit);
        summaryContainer.appendChild(submitButton);

        // エラーメッセージ表示用要素もここに追加
        const errorMsgElement = document.createElement('p');
        errorMsgElement.style.color = 'red';
        errorMsgElement.style.marginTop = '10px';
        errorMsgElement.style.textAlign = 'center';
        errorMsgElement.className = 'final-error-message';
        summaryContainer.appendChild(errorMsgElement);

        addElementToChat(summaryContainer);

        const scrollToElement = document.getElementById('summary-thankyou') || summaryContainer.querySelector('.summary-title');
        if (scrollToElement) {
            setTimeout(() => {
                scrollToElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }

    // 最終送信処理 (ダイアログ表示対応版)
    function handleFinalSubmit() {
        console.log("最終送信データ:", userAnswers);

        const finalButton = document.getElementById('final-submit-btn');
        const summaryContainer = document.querySelector('.summary-container');
        let errorMsgElement = summaryContainer ? summaryContainer.querySelector('.final-error-message') : null;

        if(finalButton) {
            finalButton.disabled = true;
            finalButton.textContent = '送信中...';
        }
        if (errorMsgElement) errorMsgElement.textContent = ''; // エラーメッセージクリア

        // ★ PHPスクリプトへのパスを確認してください
        const phpScriptPath = 'send_chat_mail.php';

        fetch(phpScriptPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userAnswers)
        })
        .then(response => {
            if (!response.ok) {
                // レスポンスがokでない場合は、レスポンスボディをテキストとして読み込もうとする
                return response.text().then(text => {
                     console.error('Server Response Text (Error):', text); // エラー内容をログに
                     throw new Error(`サーバーエラーが発生しました (HTTP ${response.status})`);
                });
            }
             // レスポンスがokならJSONとして処理
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // --- 送信成功 ---
                // 1. チャットモーダルを閉じる
                if (chatContainer) {
                    chatContainer.classList.remove('is-open');
                }
                // 2. 完了メッセージをダイアログに設定
                if (successDialogMessage) {
                    successDialogMessage.textContent = 'お問い合わせありがとうございました。\nご登録いただいたメールアドレスに後ほど資料をお送りします。';
                }
                // 3. ダイアログを表示
                if (successDialogOverlay) {
                    successDialogOverlay.classList.add('visible');
                }
                // 4. チャット内容のリセット（任意）
                // resetChat();

            } else {
                // --- 送信失敗 (PHP側で success: false) ---
                if(finalButton) {
                    finalButton.disabled = false;
                    finalButton.textContent = '同意して送信';
                }
                const errorMessage = data.error || 'メールの送信に失敗しました。時間をおいて再度お試しください。';
                 if (errorMsgElement) {
                     errorMsgElement.textContent = errorMessage;
                 } else {
                     alert(errorMessage); // フォールバック
                 }
                 console.error('Mail sending failed:', data.error || 'Unknown error from server');
            }
        })
        .catch(error => {
            // --- 通信エラー ---
            console.error('Fetch Error:', error);
            if(finalButton) {
                finalButton.disabled = false;
                finalButton.textContent = '同意して送信';
            }
            const networkErrorMessage = `通信エラーが発生しました: ${error.message}`; // エラーメッセージを含める
             if (errorMsgElement) {
                 errorMsgElement.textContent = networkErrorMessage;
             } else {
                 alert(networkErrorMessage); // フォールバック
             }
        });
    } // handleFinalSubmit 関数の終わり

    // --- ダイアログの閉じるボタンのイベントリスナー ---
    if (successDialogCloseBtn && successDialogOverlay) {
        successDialogCloseBtn.addEventListener('click', () => {
            successDialogOverlay.classList.remove('visible');
            // オプション：ダイアログを閉じたらチャット内容をリセットする場合
            // resetChat();
        });
        // オーバーレイ自身をクリックしても閉じるようにする（任意）
        successDialogOverlay.addEventListener('click', (event) => {
             if (event.target === successDialogOverlay) { // クリックされたのがオーバーレイ自身か確認
                 successDialogOverlay.classList.remove('visible');
                 // resetChat(); // 必要ならここでもリセット
             }
        });
    }

    // --- Event Listeners ---
    openChatBtns.forEach(button => {
        button.addEventListener('click', () => {
            // ダイアログが表示されていたら閉じる
            if (successDialogOverlay && successDialogOverlay.classList.contains('visible')) {
                successDialogOverlay.classList.remove('visible');
            }
            // チャットを開く
            chatContainer.classList.add('is-open');
            if (!isChatInitialized) {
                 resetChatVisuals();
                 currentQuestionIndex = 0;
                 displayQuestion(currentQuestionIndex);
                isChatInitialized = true;
            }
        });
    });

    closeChatBtn.addEventListener('click', () => {
        chatContainer.classList.remove('is-open');
        // オプション: 閉じる時にリセットする場合
        // resetChat();
    });

    // --- チャットリセット関数 ---
    function resetChat() {
        for (const key in userAnswers) { delete userAnswers[key]; }
        resetChatVisuals();
        currentQuestionIndex = 0;
        isChatInitialized = false;
         // 送信ボタン周りの状態もリセットする必要があればここに追加
         const finalButton = document.getElementById('final-submit-btn');
         if (finalButton) {
             finalButton.disabled = false;
             finalButton.textContent = '同意して送信';
         }
         const errorMsgElement = document.querySelector('.final-error-message');
         if (errorMsgElement) {
             errorMsgElement.textContent = '';
         }
    }
    // 表示だけリセットする関数
    function resetChatVisuals() {
         chatMessagesContainer.innerHTML = '';
    }

    // --- Initialization ---
    // (初期化処理があればここに記述)

}); // DOMContentLoaded の終わり
// --- END OF SCRIPT ---