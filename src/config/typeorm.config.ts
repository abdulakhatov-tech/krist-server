import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as entities from "../entities"; // Import all entities

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: "postgres",
	host: process.env.POSTGRES_HOST || "localhost",
	port: Number(process.env.POSTGRES_PORT) || 5432,
	username: process.env.POSTGRES_USERNAME || "postgres",
	password: process.env.POSTGRES_PASSWORD || "islom6975",
	database: process.env.POSTGRES_DATABASE || "krist-shop",
	entities: Object.values(entities), // Automatically load all entities
	synchronize: true, // Auto sync DB (disable in production)
};
