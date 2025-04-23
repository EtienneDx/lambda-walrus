import express, { Request, Response } from "express";
import { APIGatewayProxyEventHeaders, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyEventV2, Context, Handler } from "aws-lambda";
import cors from "cors";
import { createContext, createEvent } from "./lambda";
import { transformResult } from "./response";

if (process.argv.length < 3) {
  throw new Error("Please provide the path to the handler module as an argument.");
}

import(process.cwd() + "/" + process.argv[2]).then((mod) => {
  const handler: Handler | undefined = mod.handler;
  if (!handler) {
    throw new Error("Handler not found at the specified path: " + process.argv[2]);
  }
  startServer(handler);
});

function startServer(handler: Handler) {
  const app = express();

  app.use(cors({ origin: /http:\/\/localhost:\d+$/ }));

  app.all("*", async (req: Request, res: Response) => {
    const event = createEvent(req);

    const context = createContext();
    const result = await handler(event, context, () => {/* */});

    transformResult(res, result);
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
