// config/redis.ts

import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const connessioneRedis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null, // richiesto da BullMQ per i Worker
});