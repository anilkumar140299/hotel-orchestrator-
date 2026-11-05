import express, { NextFunction, Request, Response } from "express";
import pinoHttp from "pino-http";
import { hotelRoutes } from "./routes/hotel.routes";
import { getSupplierHotels } from "./mocks/supplier.data";
import { logger } from "./utils/logger";

export const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "hotel-offer-orchestrator" });
});

// These endpoints stand in for the two external supplier APIs.
app.get("/supplierA/hotels", (req, res) => {
  if (process.env.MOCK_SUPPLIER_A_FAIL === "true") {
    res.status(503).json({ error: "Supplier A is temporarily unavailable" });
    return;
  }
  res.json(getSupplierHotels("supplierA", String(req.query.city ?? "")));
});

app.get("/supplierB/hotels", (req, res) => {
  if (process.env.MOCK_SUPPLIER_B_FAIL === "true") {
    res.status(503).json({ error: "Supplier B is temporarily unavailable" });
    return;
  }
  res.json(getSupplierHotels("supplierB", String(req.query.city ?? "")));
});

app.use("/api", hotelRoutes);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err: error }, "Request failed");
  res.status(500).json({ error: "Internal server error" });
});
