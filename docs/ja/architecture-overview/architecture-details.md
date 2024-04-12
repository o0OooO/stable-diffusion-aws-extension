下の図は、提供された拡張機能とミドルウェア間の内部ワークフローの概要を示しています。ユーザーは、拡張機能がインストールされた単体の EC2/ ローカルサーバーに、コミュニティの WebUI を起動し続けます。一方で、ckpt のマージ、トレーニング、推論の負荷は、ユーザーの AWS アカウントにインストールされたミドルウェアが提供する RESTfulAPI を通じて、AWS クラウドに移行されます。ミドルウェアは、AWS アカウントごとに存在し、作業ノードとして別々にインストールされ、WebUI を制御ノードとして通信することができます。ユーザーは、使用する AWS アカウントのエンドポイント URL と API キーを入力するだけで済みます。

![workflow](../images/workflow.png) 
<center> 全体的なワークフロー </center> 

ミドルウェアは、WebUI 拡張機能が AWS (Amazon SageMaker、S3 など)と対話できるように、OpenAPI の仕様に準拠した RESTfulAPI を提供します。主な機能は、リクエストの認証、リクエストの振り分け (SageMaker.jumpstart/model/predictor/estimator/tuner/utilities など)、モデルのトレーニング、モデルの推論、およびその他のライフサイクル管理です。以下の図は、ミドルウェアの全体アーキテクチャを示しています。

![middleware](../images/middleware.png) 
<center> ミドルウェアのアーキテクチャ </center> 

- WebUI コンソールのユーザーは、割り当てられた API トークンを使って API ゲートウェイにリクエストを送信し、認証されます (AWS 認証情報は不要)。
- API ゲートウェイは、URL のプレフィックスに応じて、モデルのアップロード、ckpt のマージ、モデルのトレーニングや推論などの対応するタスクを実行する Lambda 関数にリクエストを振り分けます。同時に、Lambda は操作メタデータを DynamoDB に記録します。
- トレーニング中は、Step Function が呼び出されて、AmazonSageMaker によるトレーニングと SNS による通知を含むトレーニングプロセスを調整します。推論中は、Lambda が非同期推論のために AmazonSageMaker を呼び出します。トレーニングデータ、モデル、checkpoint は S3 バケットに保存されます。

拡張機能のコンテナイメージをコミュニティと同期させるために、追加の CI/CD パイプライン(下図)が必要になる可能性があります。これにより、コミュニティのコミットを自動的に追跡し、新しいコンテナイメージをパックして構築できるようになり、ユーザーは手動操作なしに最新の拡張機能を起動できます。

![cicd](../images/cicd.png) 
<center> イメージの CI/CD ワークフロー </center> 