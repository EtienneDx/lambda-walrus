import { APIGatewayProxyEventHeaders, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyEventV2, Context } from "aws-lambda";
import { Request } from "express";

export function createEvent(req: Request): APIGatewayProxyEventV2 {
  console.log(typeof req.body, req.body);
  return {
    version: "2.0",
    rawPath: req.path,
    headers: req.headers as APIGatewayProxyEventHeaders,
    queryStringParameters: req.query as APIGatewayProxyEventQueryStringParameters | undefined,
    body: JSON.stringify(req.body),
    isBase64Encoded: false,
    pathParameters: {},
    stageVariables: {},
    requestContext: {
      accountId: "",
      apiId: "",
      domainName: "",
      domainPrefix: "",
      requestId: "",
      stage: "",
      time: "",
      timeEpoch: 0,
      routeKey: "",
      http: {
        method: req.method,
        path: req.path,
        protocol: req.protocol,
        sourceIp: req.ip ?? "",
        userAgent: req.get("User-Agent") ?? "",
      }
    },
    rawQueryString: "",
    routeKey: "",
  };
}

export function createContext(): Context {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    memoryLimitInMB: "",
    awsRequestId: "",
    logGroupName: "",
    logStreamName: "",
    getRemainingTimeInMillis: () => 0,
    done: () => {/* */},
    fail: () => {/* */},
    succeed: () => {/* */},
  };
}