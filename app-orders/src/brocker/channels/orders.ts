import { broker } from "../broker.ts";

export const orders = await broker.createChannel();

orders.assertQueue("orders");
