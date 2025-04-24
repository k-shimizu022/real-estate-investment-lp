// --- START OF SCRIPT ---
document.addEventListener('DOMContentLoaded', () => { // DOM読み込み後に実行

    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatContainer = document.getElementById('chat-container');
    const openChatBtns = document.querySelectorAll('.open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');

    if (!chatMessagesContainer || !chatContainer || !closeChatBtn || openChatBtns.length === 0) {
        console.error('チャットに必要なHTML要素が見つかりません。IDやクラス名を確認してください: #chat-messages, #chat-container, #close-chat-btn, .open-chat-btn');
        return;
    }

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
        // 自動スクロールはここでは行わない
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
            targetElement.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    function clearError(targetElement) {
        const errorElement = targetElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }


    // 生年月日入力グループのコンテナを作成 (修正: 横並びレイアウト)
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
            // --- inputWrapper はフィールド全体を包む ---
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'birthdate-field-wrapper'; // CSS適用のためクラス追加

            // --- input と label を横並びにするためのrow ---
            const fieldRow = document.createElement('span');
            fieldRow.className = 'birthdate-field-row'; // CSS適用のためクラス追加

            const input = document.createElement('input');
            input.type = 'tel';
            input.pattern = field.pattern;
            input.maxLength = field.maxLength;
            input.id = `input-${step.id}-${field.idSuffix}`;
            input.required = true;
            // width は CSS で指定
            inputElements[field.idSuffix] = input;

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = field.label;

            fieldRow.appendChild(input); // input を row に追加
            fieldRow.appendChild(label); // label を row に追加

            const exampleText = document.createElement('small');
            exampleText.className = 'birthdate-example';
            exampleText.textContent = field.example;

            input.addEventListener('input', () => clearError(container));

            if (fieldIndex < fields.length - 1) {
                input.addEventListener('input', (e) => {
                    if (e.target.value.length >= field.maxLength) {
                        const nextFieldSuffix = fields[fieldIndex + 1].idSuffix;
                        inputElements[nextFieldSuffix]?.focus();
                    }
                });
            }

            // --- wrapper に row, example, error を追加 ---
            inputWrapper.appendChild(fieldRow); // 横並びの input+label
            inputWrapper.appendChild(exampleText); // その下に例
            container.appendChild(inputWrapper);
        });

        // グループ全体用のエラーメッセージ領域を決定ボタンの前に追加 ---
        const groupErrorSpan = document.createElement('span');
        groupErrorSpan.className = 'error-message group-error'; // 新しいクラスを付与
        groupErrorSpan.id = `error-${step.id}-group`; // グループ用ID
        container.appendChild(groupErrorSpan);

        const submitButton = document.createElement('button');
        submitButton.textContent = '決定';
        submitButton.classList.add('submit-input-btn');

        submitButton.addEventListener('click', () => {
            let isValid = true;
            clearError(container);

            const year = inputElements['Year'].value;
            const month = inputElements['Month'].value;
            const day = inputElements['Day'].value;

            // バリデーションチェックのみ行う
            if (!year.match(/^\d{4}$/)) isValid = false;
            if (!month.match(/^\d{2}$/)) isValid = false;
            else if (parseInt(month) < 1 || parseInt(month) > 12) isValid = false;
            if (!day.match(/^\d{2}$/)) isValid = false;
            else if (parseInt(day) < 1 || parseInt(day) > 31) isValid = false;

            if (isValid) {
                userAnswers[`${step.id}Year`] = year;
                userAnswers[`${step.id}Month`] = month;
                userAnswers[`${step.id}Day`] = day;
                handleBirthdateInput(index);
            } else {
                // グループエラーを表示 ---
                displayError(container, '生年月日を正しく入力してください (年4桁、月2桁、日2桁)');
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

        // フィールド定義修正
        const fields = [
            { id: 'name', label: 'お名前', placeholder: '例：山田太郎', pattern: "^[^a-zA-Z0-9 -~｡-ﾟ]+$", title: '全角で入力してください（半角英数字不可）', errorId: `error-input-name` },
            { id: 'kana', label: 'ふりがな', placeholder: '例：やまだたろう', pattern: "^[ぁ-んー\\u3000]+$", title: '全角ひらがなで入力してください', errorId: `error-input-kana` } // 全角スペース \u3000 を許容
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
            input.placeholder = field.placeholder; // "例：" を追加
            if (field.pattern) {
                input.pattern = field.pattern; // 新しいパターン
                input.title = field.title; // 新しい説明
            }
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
            clearError(nameInput.parentNode);
            clearError(kanaInput.parentNode);

            const nameValue = nameInput.value; // trimしない値でパターンチェック
            const kanaValue = kanaInput.value; // trimしない値でパターンチェック
            const nameTrimmed = nameValue.trim();
            const kanaTrimmed = kanaValue.trim();


            if (nameTrimmed === '') {
                 displayError(nameInput.parentNode, 'お名前を入力してください。');
                 isValid = false;
            } else if (nameInput.pattern && nameValue !== '' && !new RegExp(nameInput.pattern).test(nameValue)) { // trim前の値でチェック
                 displayError(nameInput.parentNode, nameInput.title || 'お名前の形式が正しくありません。');
                 isValid = false;
            }

             if (kanaTrimmed === '') {
                 displayError(kanaInput.parentNode, 'ふりがなを入力してください。');
                 isValid = false;
            } else if (kanaInput.pattern && kanaValue !== '' && !new RegExp(kanaInput.pattern).test(kanaValue)) { // trim前の値でチェック
                 // エラーメッセージから「スペースで」を削除
                 displayError(kanaInput.parentNode, kanaInput.title || 'ふりがなの形式が正しくありません。');
                 isValid = false;
             }

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
        const inputWrapper = document.createElement('div'); // input と error をまとめるラッパー
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
                 displayError(inputWrapper, '入力してください。');
                 isValid = false;
            }
            else if (inputElement.type === 'email' && trimmedValue !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                 displayError(inputWrapper, '有効なメールアドレスを入力してください。');
                 isValid = false;
            }
             else if (inputElement.type === 'tel' && trimmedValue !== '' && !/^[0-9\-]+$/.test(value)) {
                  displayError(inputWrapper, '有効な電話番号を入力してください。');
                  isValid = false;
             }

            if (isValid) {
                 handleTextInput(value, index);
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
                if(step.required === false) continue;
                let answered = false;
                if (step.inputType === 'birthdate-group') answered = userAnswers.hasOwnProperty(`${step.id}Year`);
                else if (step.inputType === 'name-kana-group') answered = userAnswers.hasOwnProperty('name');
                else if (step.id) answered = userAnswers.hasOwnProperty(step.id);
                if (!answered) { firstUnansweredIndex = i; break; }
            }
            if (firstUnansweredIndex !== -1) {
                 console.warn(`未回答の必須質問があります (インデックス: ${firstUnansweredIndex})。該当質問を表示します。`);
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
        let isNewBotMessage = false; // 新規メッセージフラグ

        if (!botMessageElement) {
            // --- 修正: 新規ボットメッセージ追加時にスクロールを実行 ---
            isNewBotMessage = true; // フラグを立てる
            botMessageElement = document.createElement('div');
            botMessageElement.classList.add('message', 'bot-message');
            const questionText = typeof currentStep.question === 'function'
                ? currentStep.question(userAnswers)
                : currentStep.question;
            botMessageElement.textContent = questionText || '';
            botMessageElement.setAttribute('data-question-index', questionIndex);
            addElementToChat(botMessageElement); // 末尾に追加（スクロールはしない）

            // 新しいボットメッセージの場合のみ、追加後にスクロールを実行
            setTimeout(() => {
                // 新しいボットメッセージの先頭が表示領域の上部(マージン考慮)に来るようにスクロール
                botMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50); // レンダリングのためのわずかな遅延
            // --- 修正完了 ---
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

        // 新しい入力要素の生成
        const optionsContainer = createOptionsContainer(currentStep, questionIndex);
        const birthdateContainer = createBirthdateContainer(currentStep, questionIndex);
        const nameKanaContainer = createNameKanaContainer(currentStep, questionIndex);
        const genericInputContainer = createGenericInputContainer(currentStep, questionIndex);

        let inputElementToInsert = null;
        if (optionsContainer) inputElementToInsert = optionsContainer;
        else if (birthdateContainer) inputElementToInsert = birthdateContainer;
        else if (nameKanaContainer) inputElementToInsert = nameKanaContainer;
        else if (genericInputContainer) inputElementToInsert = genericInputContainer;

        // 生成された入力コンテナをボットメッセージの直後に挿入
        if (inputElementToInsert) {
            addElementToChat(inputElementToInsert, botMessageElement); // 挿入（スクロールなし）
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

        const oldUserMsg = chatMessagesContainer.querySelector(`.user-message[data-question-index="${questionIndex}"]`);
        const oldRedoBtn = chatMessagesContainer.querySelector(`.redo-button[data-question-index="${questionIndex}"]`);
        if(oldUserMsg) oldUserMsg.remove();
        if(oldRedoBtn) oldRedoBtn.remove();

        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('message', 'user-message');
        userMessageElement.style.whiteSpace = 'pre-wrap';
        userMessageElement.textContent = value;
        userMessageElement.setAttribute('data-question-index', questionIndex);
        addElementToChat(userMessageElement, botMessageElement); // 挿入（スクロールなし）

        if (!isGroupInput) {
             const currentStep = chatFlow[questionIndex];
             if (currentStep && currentStep.id) userAnswers[currentStep.id] = value;
        }

        // --- 修正: やり直しボタンの表示条件 ---
        const nextStepIndex = questionIndex + 1;
        // 次のステップが存在すればやり直しボタンを追加（summaryの前でもOK）
        if (nextStepIndex < chatFlow.length) {
             if (!chatMessagesContainer.querySelector(`.redo-button[data-question-index="${questionIndex}"]`)) {
                 const redoButton = document.createElement('button');
                 redoButton.classList.add('redo-button');
                 redoButton.textContent = '回答をやり直す';
                 redoButton.setAttribute('data-question-index', questionIndex);
                 redoButton.addEventListener('click', () => handleRedoClick(questionIndex));
                 addElementToChat(redoButton, userMessageElement); // 挿入（スクロールなし）
             }
        }
        // --- 修正完了 ---


        let nextQuestionIndex = questionIndex + 1;
        // 回答済みスキップロジック
        while (nextQuestionIndex < chatFlow.length) {
            const step = chatFlow[nextQuestionIndex];
             if (step.type === 'summary') break;
            let answered = false;
            if (step.inputType === 'birthdate-group') answered = userAnswers.hasOwnProperty(`${step.id}Year`);
            else if (step.inputType === 'name-kana-group') answered = userAnswers.hasOwnProperty('name');
            else if (step.id) answered = userAnswers.hasOwnProperty(step.id);

            if (answered) {
                 // 必須でない項目はスキップしない方が良い場合もあるが、一旦スキップ
                 nextQuestionIndex++;
            } else {
                break; // 未回答が見つかったら抜ける
            }
        }

        currentQuestionIndex = nextQuestionIndex;
        // 次の質問表示（末尾追加ならスクロールされる）
        displayQuestion(currentQuestionIndex);
    }


    // 「回答をやり直す」ボタンの処理
    function handleRedoClick(questionIndexToRedo) {
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

        // 該当の質問の入力要素を再表示する（スクロールは displayQuestion 内で制御）
        displayQuestion(questionIndexToRedo);
    }


    // 確認画面を表示する
    function displaySummary() {
        // --- 修正: 既存メッセージの削除処理を強化 ---
        const existingSummaryElements = chatMessagesContainer.querySelectorAll(
            '.summary-container, #summary-thankyou, #summary-instruction'
        );
        existingSummaryElements.forEach(el => el.remove());
        // --- 修正完了 ---


        const summaryStep = chatFlow.find(step => step.type === 'summary');
        if (!summaryStep) return;

        const summaryContainer = document.createElement('div');
        summaryContainer.classList.add('summary-container');

        // --- 修正: メッセージ追加前に存在チェック ---
        // displaySummary が呼ばれる前に既存メッセージを削除したので、ここでは単純に追加
        const thankYouMsg = document.createElement('div');
        thankYouMsg.id = 'summary-thankyou'; // ID追加
        thankYouMsg.classList.add('message', 'bot-message');
        thankYouMsg.textContent = 'ご回答ありがとうございました。';
        addElementToChat(thankYouMsg); // 末尾追加 -> スクロールされる

        const confirmationInstruction = document.createElement('div');
        confirmationInstruction.id = 'summary-instruction'; // ID追加
        confirmationInstruction.classList.add('message', 'bot-message');
        confirmationInstruction.textContent = '入力内容・利用規約等をご確認の上、「同意して送信」を押してください。';
        addElementToChat(confirmationInstruction); // 末尾追加 -> スクロールされる
        // --- 修正完了 ---


        const titleElement = document.createElement('h3');
        titleElement.classList.add('summary-title');
        titleElement.textContent = summaryStep.questionText || '入力内容のご確認';
        summaryContainer.appendChild(titleElement);

        // 入力内容リスト表示
        for (const step of chatFlow) {
             if (step.type === 'summary') continue;
             let displayValue = null;
             // --- 修正: ラベルからコロン削除 ---
             let displayLabel = step.questionText ? step.questionText.replace(/：$/, '') : step.id; // 末尾のコロンを削除
             // --- 修正完了 ---


             if (step.inputType === 'birthdate-group') {
                 if (userAnswers[`${step.id}Year`]) {
                     displayValue = `${userAnswers[`${step.id}Year`]}年${userAnswers[`${step.id}Month`]}月${userAnswers[`${step.id}Day`]}日`;
                     displayLabel = step.questionText ? step.questionText.replace(/：$/, '') : step.id;
                 }
             } else if (step.inputType === 'name-kana-group') {
                 if (userAnswers['name']) {
                     displayValue = `名前: ${userAnswers['name']}\nふりがな: ${userAnswers['kana']}`;
                     displayLabel = step.questionText ? step.questionText.replace(/：$/, '') : step.id;
                 }
             } else if (step.id && userAnswers.hasOwnProperty(step.id)) {
                 displayValue = userAnswers[step.id];
             }

            if (displayValue !== null && String(displayValue).trim() !== '') {
                const item = document.createElement('div');
                item.classList.add('summary-item');
                const valueSpan = document.createElement('span');
                // --- 修正: 回答値にクラス追加 ---
                valueSpan.className = 'summary-answer-value';
                // --- 修正完了 ---
                valueSpan.style.whiteSpace = 'pre-wrap';
                valueSpan.textContent = displayValue;
                // --- 修正: コロン削除 ---
                item.innerHTML = `<strong>${displayLabel}</strong> `; // コロン削除
                // --- 修正完了 ---
                item.appendChild(valueSpan);
                summaryContainer.appendChild(item);
            }
        }

         const linksDiv = document.createElement('div');
         linksDiv.classList.add('policy-links');
         linksDiv.innerHTML = `
             <a href="#" target="_blank">利用規約</a>
             <a href="#" target="_blank">プライバシーポリシー</a>
             <a href="#" target="_blank">個人情報のお取扱いについて</a>
         `;
         summaryContainer.appendChild(linksDiv);

        const submitButton = document.createElement('button');
        submitButton.id = 'final-submit-btn';
        submitButton.textContent = '同意して送信';
        submitButton.addEventListener('click', handleFinalSubmit);
        summaryContainer.appendChild(submitButton);

        addElementToChat(summaryContainer); // 末尾追加 -> スクロールされる

        // thankYouMsg または titleElement をターゲットにする
        const scrollToElement = document.getElementById('summary-thankyou') || summaryContainer.querySelector('.summary-title');
        if (scrollToElement) {
            setTimeout(() => {
                // 要素の先頭が表示領域の上部(マージン考慮)に来るようにスクロール
                scrollToElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100); // addElementToChat のスクロールと競合しないよう少し長めに遅延
        }
    }

    // 最終送信処理
    function handleFinalSubmit() {
        console.log("最終送信データ:", userAnswers);
        // !!! TODO: ここで実際にデータをサーバーに送信する処理を実装する !!!

        const finalButton = document.getElementById('final-submit-btn');
        if(finalButton) {
            finalButton.disabled = true;
            finalButton.textContent = '送信中...';
        }

        setTimeout(() => {
            if(finalButton) finalButton.textContent = '送信完了';

            const thankYouMessage = document.createElement('div');
            thankYouMessage.classList.add('message', 'bot-message');
            thankYouMessage.textContent = 'お問い合わせありがとうございました。担当者からの連絡をお待ちください。';
            addElementToChat(thankYouMessage); // 末尾追加 -> スクロールされる

             chatMessagesContainer.querySelectorAll('.redo-button').forEach(btn => btn.remove());

        }, 500);
    }


    // --- Event Listeners ---
    openChatBtns.forEach(button => {
        button.addEventListener('click', () => {
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

    // (オプション) チャットリセット関数
    function resetChat() {
        for (const key in userAnswers) { delete userAnswers[key]; }
        resetChatVisuals();
        currentQuestionIndex = 0;
        isChatInitialized = false;
    }
    // 表示だけリセットする関数
    function resetChatVisuals() {
         chatMessagesContainer.innerHTML = '';
    }

    // --- Initialization ---
    // ページ読み込み時にはチャットを開始しない

}); // DOMContentLoaded の終わり
// --- END OF SCRIPT ---
