import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { z } from "zod";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

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
  (request, reply) => {
    const { amount } = request.body;

    console.log("[Orders] Received order with amount:", amount);

    return reply.status(201).send();
  }
);

app.listen({ host: "0.0.0.0", port: 3000 }).then(() => {
  console.log("[Orders] HTTP server running!");
});
