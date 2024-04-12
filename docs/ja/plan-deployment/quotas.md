
# クォータ

Amazon SageMaker リソースのクォータを増加させるには、以下の手順に従ってください:

1. AWS マネジメントコンソールにログインし、Service Quotas コンソールに移動します。
2. ナビゲーションパネルから「 AWS サービス」を選択します。
3. リストから「 Amazon SageMaker 」を選択するか、検索ボックスにサービス名を入力します。
4. クォータの増加をリクエストします: クォータが調整可能な場合、ボタンまたは名称を選択し、「クォータの増加をリクエスト」を選択します。
5. クォータの値を変更します: 「クォータの値を変更」フィールドに新しい値を入力します。新しい値は現在の値よりも大きくなければなりません。
6. リクエストを送信します: 「リクエスト」をクリックして、AWS にクォータ増加のリクエストを送信します。

    !!!Important お知らせ
        一部の AWS サービスは特定の地域でのみ利用可能であることにご注意ください。異なる地域でクォータ増加のリクエストをする場合は、適切な地域を選択してください。

クォータ増加のリクエストを送信した後は、以下の手順でステータスを確認できます:

1. リクエストのステータスを確認する : Service Quotas コンソールに戻り、ナビゲーションパネルから「ダッシュボード」を選択します。保留中のリクエストについては、リクエストの状態をクリックして、リクエストの領収書を開きます。リクエストの初期ステータスは「保留中」です。ステータスが「クォータがリクエストされた」に変更されると、AWS サポートのケース番号が表示されます。ケース番号をクリックしてリクエストの領収書を開きます。
2. クォータリクエストの履歴を確認する: 保留中または最近解決されたリクエストを表示するには、Service Quotas コンソールのナビゲーションパネルから「クォータリクエストの履歴」を選択します。

    !!!Important お知らせ
        クォータ増加のリクエストには優先サポートがありませんので、処理に時間がかかる場合があります。緊急のリクエストの場合は、AWS サポートに直接お問い合わせください。

クォータについての詳細は以下の AWS ドキュメントを参照してください:

* [Amazon SageMaker サービスクォータ ](https://docs.aws.amazon.com/general/latest/gr/sagemaker.html) 
* [ クォータ増加のリクエスト ](https://docs.aws.amazon.com/servicequotas/latest/userguide/request-quota-increase.html) 