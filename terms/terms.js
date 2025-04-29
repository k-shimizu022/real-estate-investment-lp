document.addEventListener('DOMContentLoaded', function() {
    const policyContents = document.querySelectorAll('.policy-content');
    const footerLinks = document.querySelectorAll('footer .footer-links a');

    function setActiveContent() {
        // 現在のハッシュを取得 (デフォルトは #terms)
        // URLにハッシュがない場合や、対応する要素がない場合は #terms を使う
        let hash = window.location.hash || '#terms';
        if (!document.getElementById(hash.substring(1))) {
            hash = '#terms';
        }
        const targetId = hash.substring(1); // #を除いたID

        // すべてのコンテンツを非表示にし、フッターリンクのアクティブクラスを削除
        policyContents.forEach(content => content.classList.remove('active'));
        footerLinks.forEach(link => link.classList.remove('active'));

        // 対応するコンテンツを表示
        const activeContent = document.getElementById(targetId);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // 対応するフッターリンクをアクティブにする
        const activeFooterLink = document.querySelector(`footer .footer-links a[href="${hash}"]`);
        if (activeFooterLink) {
            activeFooterLink.classList.add('active');
        }

        // ページのタイトルを更新
        const pageTitleElement = activeContent ? activeContent.querySelector('h1') : null;
        if(pageTitleElement) {
            document.title = `${pageTitleElement.textContent} - Daimlar Corporation`;
        } else {
             document.title = '規約・ポリシー - Daimlar Corporation'; // デフォルトタイトル
        }

        // ページトップにスクロール (任意)
        window.scrollTo(0, 0);
    }

    // ハッシュが変更されたらコンテンツを切り替え
    window.addEventListener('hashchange', setActiveContent);

    // 初期表示処理
    setActiveContent();

    // フッターリンクのクリックイベント (念のため)
    // 基本的にはブラウザが hashchange イベントを発火するが、
    // クリック時に即座に見た目を反映させたい場合や確実性を高めるために追加しても良い
    footerLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetHash = this.getAttribute('href');
            // ページ内リンク（#で始まるもの）の場合のみ処理
            if (targetHash.startsWith('#')) {
            // 少し遅延させて hashchange イベントの発火を待つか、
            // ここで直接 setActiveContent を呼び出すことも可能
            // (ただし、URLのハッシュはクリック時に自動で変わる)
            // 例: setTimeout(setActiveContent, 0);
            }
        });
    });
});