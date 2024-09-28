/**
 * Copyright (c) 2020-2024, Social Image Ltd. All rights reserved.
 */
import dynamoose from "dynamoose";
import dotenv from "dotenv";

dotenv.config();

const isLocal = process.env.NODE_ENV === "development";

if (isLocal) {
  dynamoose.aws.ddb.local("http://localhost:8000");
}

export default dynamoose;