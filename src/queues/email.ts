import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { EmailArgs, sendEmail } from "src/utils/email.js";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

console.log(`Connecting to Redis at ${REDIS_HOST}:${REDIS_PORT}`);

const connection = new Redis({
	host: REDIS_HOST,
	port: REDIS_PORT,
	maxRetriesPerRequest: null,
	retryStrategy(times) {
		const delay = Math.min(times * 50, 2000);
		console.log(`Retrying Redis connection attempt ${times} after ${delay}ms`);
		return delay;
	},
});

connection.on('connect', () => {
	console.log('Successfully connected to Redis');
});

connection.on('error', (error) => {
	console.error('Redis connection error:', error);
});

type EmailQueueJobNames = "sendEmail";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const emailQueue = new Queue<EmailArgs, any, EmailQueueJobNames>("emails", {
	connection,
	defaultJobOptions: { removeOnComplete: false },
});

export const emailWorker = new Worker<EmailArgs>(
	emailQueue.name,
	async ({ data }) => sendEmail(data),
	{ connection, limiter: { max: 14, duration: 1000 } },
);

emailWorker.on("error", (err) => {
	console.error(err);
});
