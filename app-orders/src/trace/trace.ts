import { trace } from "@opentelemetry/api";

if (!process.env.OTEL_SERVICE_NAME) {
  throw new Error(
    "OTEL_SERVICE_NAME environment variable is not set. Please set it to 'orders' in the .env file."
  );
}

export const tracer = trace.getTracer(process.env.OTEL_SERVICE_NAME);
