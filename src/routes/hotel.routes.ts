import { Router } from "express";
import { getHotels } from "../controllers/hotel.controller";

export const hotelRoutes = Router();
hotelRoutes.get("/hotels", getHotels);
