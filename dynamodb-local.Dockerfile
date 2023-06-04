FROM amazon/dynamodb-local:latest
ENTRYPOINT ["java" ,"-jar", "DynamoDBLocal.jar", "-inMemory","-sharedDb"]