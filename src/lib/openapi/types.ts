/** Tipos mínimos OpenAPI 3 (sin dependencia de openapi-types). */
export namespace OpenAPIV3 {
  export type Document = {
    openapi: string;
    info: {
      title: string;
      version: string;
      description?: string;
      contact?: { name?: string; url?: string; email?: string };
    };
    servers?: Array<{ url: string; description?: string }>;
    tags?: Array<{ name: string; description?: string }>;
    paths: Record<string, PathItem>;
    components?: {
      securitySchemes?: Record<string, SecurityScheme>;
      schemas?: Record<string, SchemaObject>;
    };
  };

  export type PathItem = {
    get?: Operation;
    post?: Operation;
    put?: Operation;
    delete?: Operation;
  };

  export type Operation = {
    tags?: string[];
    summary?: string;
    description?: string;
    security?: Array<Record<string, string[]>>;
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses: Record<string, Response>;
  };

  export type Parameter = {
    name: string;
    in: "query" | "path" | "header";
    required?: boolean;
    schema?: SchemaObject;
  };

  export type RequestBody = {
    required?: boolean;
    content: Record<string, { schema: SchemaRef }>;
  };

  export type Response = {
    description: string;
    content?: Record<string, { schema: SchemaRef }>;
  };

  export type SchemaRef = { $ref: string } | SchemaObject;

  export type SchemaObject = {
    type?: string;
    format?: string;
    properties?: Record<string, SchemaObject>;
    required?: string[];
    enum?: string[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
    example?: unknown;
    description?: string;
    items?: SchemaObject;
  };

  export type SecurityScheme =
    | { type: "http"; scheme: string; bearerFormat?: string; description?: string }
    | { type: "apiKey"; in: "query" | "header"; name: string; description?: string };
}
