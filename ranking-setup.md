# JUMP NARUNARU ランキング連携メモ

連携先スプレッドシート:

https://docs.google.com/spreadsheets/d/1-R6KaGYbttNxMPQ85FgC4zg68hZfGPcg4LKjmS8Auqs/edit

※以前作った独立Apps Scriptリンクは、Googleアカウント違いで開けない可能性があります。使わずに、上記スプレッドシートからApps Scriptを開いてください。

## 1. スプレッドシートを作る

上記スプレッドシートを使います。

## 2. Apps Scriptを貼る

スプレッドシートで `拡張機能 > Apps Script` を開き、`google-apps-script.gs` の中身を貼り付けます。

貼り付けたら `setupRankingSheet` を一度実行して、権限を許可します。

## 3. ウェブアプリとしてデプロイする

Apps Scriptで `デプロイ > 新しいデプロイ > ウェブアプリ` を選びます。

- 実行ユーザー: 自分
- アクセスできるユーザー: 全員

デプロイ後に表示される `/exec` で終わるURLをコピーします。

## 4. HTMLにURLを設定する

`jump-narunaru.html` のこの行に、コピーしたURLを入れます。

```js
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxxqxvYZRQafob5lhhvf0bTEPwV7Ev-49ZDY6bfOyHehZXPyZvaYBzv2f1PhAiPMF5a/exec';
```

現在は上記URLを設定済みです。

例:

```js
const SHEET_API_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxx/exec';
```

これで結果画面からスコア登録でき、タイトル画面の `RANKING TOP 50` から上位50件を見られます（一覧はドラッグ／マウスホイールでスクロール）。
