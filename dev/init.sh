aws dynamodb create-table \
    --table-name EventConfigTable \
    --attribute-definitions \
        AttributeName=configId,AttributeType=N \
    --key-schema \
        AttributeName=configId,KeyType=HASH \
--provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5 \
--endpoint-url http://docker.for.mac.localhost:8000
aws dynamodb put-item --table-name EventConfigTable --item '{"configId": {"N": "0"}, "lastRun": {"S": "Tuesday, 20 September 2020 19:27:37"}}' --endpoint-url http://localhost:8000
aws dynamodb scan --table-name EventConfigTable --endpoint-url http://localhost:8000