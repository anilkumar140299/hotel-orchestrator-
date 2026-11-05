import { Client, Connection } from "@temporalio/client";
import { env } from "../config/env";

let connection: Connection | undefined;
let client: Client | undefined;

export async function getTemporalClient(): Promise<Client> {
  if (!client) {
    connection = await Connection.connect({ address: env.temporalAddress });
    client = new Client({
      connection,
      namespace: env.temporalNamespace
    });
  }
  return client;
}

export async function closeTemporalClient(): Promise<void> {
  await connection?.close();
  connection = undefined;
  client = undefined;
}
