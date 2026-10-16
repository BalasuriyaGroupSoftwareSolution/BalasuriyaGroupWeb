import type { IncomingMessage, ServerResponse } from "http";

export interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  cookies: Record<string, string>;
  body: any;
}

export interface VercelResponse extends ServerResponse {
  status(statusCode: number): this;
  json(jsonBody: any): this;
  send(body: any): this;
}
