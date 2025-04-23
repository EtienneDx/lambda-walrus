export type CommonError = {
  statusCode: number;
  body: string;
};

const CommonErrors = {
  Unauthorized: {
    statusCode: 401,
    body: "Unauthorized",
  },
  MethodNotAllowed: {
    statusCode: 405,
    body: "Method Not Allowed",
  },
  BadRequest: {
    statusCode: 400,
    body: "Bad Request",
  },
  InternalServerError: {
    statusCode: 500,
    body: "Internal Server Error",
  },
  NotFound: {
    statusCode: 404,
    body: "Not Found",
  },
};

export { CommonErrors };