# KSS Festival Admin

このプロジェクトは、Firebaseでホストしています。<br>
このFirebaseプロジェクトへのアクセス権がほしい方は、Slackの`Asa`まで連絡ください。

## 開発方法
1. Clone
2. `yarn install`
3. `yarn start`

## ディレクトリ構成
 - functions: Firebase Cloud Functionsのディレクトリ
 - public: デプロイされるディレクトリ
 - src: public/bundle.js の元のtsファイル

## サービス構成
 - cashier: レジシステム
 - monitor: 待ち時間モニターの情報変更
 - proceeds: 売上確認
 - chat: チャットシステム
 - admin/chat: 管理者用チャットシステム
 - admin/pay_charge: KSS Payのチャージシステム

## 貢献したい方
[CONTRIBUTING.md](./CONTRIBUTING.md) を見てください

## LICENSE
MIT License. [LICENSE file](./LICENSE) for more information.
