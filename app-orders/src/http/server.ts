import "@opentelemetry/auto-instrumentations-node/register";
import { trace } from "@opentelemetry/api";
import { setTimeout } from "node:timers/promises";

import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { z } from "zod";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { schema } from "../db/schema/index.ts";
import { db } from "../db/client.ts";
import { randomUUID } from "node:crypto";
import { dispatchOrderCreated } from "../brocker/messages/order-created.ts";
import { tracer } from "../trace/trace.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, { origin: "*" });

app.get("/health", () => {
  return "Ok";
});

// Escalonamento horizontal
// Deploy Blue-green deployment

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.coerce.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;

    console.log("[Orders] Received order with amount:", amount);

    const orderId = randomUUID();

    await db.insert(schema.orders).values({
      id: orderId,
      customerId: "859a4043-d446-4fde-abc3-d6b94a4a8e5b",
      amount,
    });

    const span = tracer.startSpan("ACHO QUE TA DANDO MERDA AQUI");

    span.setAttribute("teste", "valor do teste");

    await setTimeout(2000);

    span.end();

    dispatchOrderCreated({
      orderId,
      amount,
      customer: {
        id: "859a4043-d446-4fde-abc3-d6b94a4a8e5b",
      },
    });

    return reply.status(201).send();
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[Orders] HTTP server running!");
});
