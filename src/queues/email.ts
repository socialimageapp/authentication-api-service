import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { EmailArgs, sendEmail } from "src/utils/email";

const connection = new IORedis({ maxRetriesPerRequest: null });

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
	// eslint-disable-next-line no-console
	console.error(err);
});
