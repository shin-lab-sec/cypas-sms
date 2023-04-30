# userAgent

curriculum を`docker compose up`する時に同一ネットワークワーク上に起動するコンテナ群。各ユーザーはこのコンテナに接続して curriculum を体験する。

## 仕様

- 各 userAgent のサービス名とコンテナ名は `user-agent` から始まる。（curriculum のコンテナ名と衝突しないように）
- 各 userAgent のサービス名には UNIQUE を含める。（悲しい事情は[ここ](https://github.com/shin-lab-sec/cyber-range-server/blob/master/express/src/services/scenario-services.ts)のコメントを参照）
- 環境変数`USER_AGENT_PORT`, `USER_AGENT_NAME`, `USER_AGENT_PASSWORD`は本番環境で注入される。
- 環境変数`USER_AGENT_PORT`のみ必須。これが無いとユーザーがコンテナに接続できない。
- それ以外の環境変数は、.env で定義して使用可能だが、本番環境でも値が変わらないので注意。
