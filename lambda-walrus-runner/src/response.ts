import { APIGatewayProxyResultV2 } from "aws-lambda";
import { Response } from "express";

export function transformResult(res: Response, result: APIGatewayProxyResultV2): void {
  if (result) {
    if (typeof result === "string") {
      res.status(200).send(result);
    } else {
      res.status(result.statusCode ?? 200);
      try {
        JSON.parse(result.body ?? "");
        res.setHeader("Content-Type", "application/json");
      }
      catch {
        res.setHeader("Content-Type", "text/plain");
      }
      res.send(result.body);
    }
  } else {
    res.status(200).send();
  }
}