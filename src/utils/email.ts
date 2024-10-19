import sendgridEmailClient, { MailDataRequired } from "@sendgrid/mail";
import { z } from "zod";

export const emailTemplates = {
	cancel: {
		id: "d-331456d5eb3f48a9867de8f953dcfb7d",
		schema: z.object({ name: z.string() }),
	},
	pause: {
		id: "d-015d2b382b5d4d41bc99406fdf8a7460",
		schema: z.object({ name: z.string() }),
	},
	welcome: {
		id: "d-b6c15d3fbf2f4724a08d1d9bd85456f6",
		schema: z.object({ name: z.string() }),
	},
	creditReset: {
		id: "d-15260d8e27e045a9a8f2fe51b6bfdd45",
		schema: z.object({ name: z.string() }),
	},
	trialExpired: {
		id: "d-3bbeb7752f714960b6520077f7b924ff",
		schema: z.object({ name: z.string() }),
	},
	scheduledPosts: {
		id: "d-1f1092b27b2e475e9ae18c5ef5d687c0",
		schema: z.object({ name: z.string() }),
	},
	undoCancel: {
		id: "d-98efa9cbc6e94ce99293468442ad8f4b",
		schema: z.object({ name: z.string() }),
	},
	confirmEmail: {
		id: "d-29c40aa6582d40df85535c6b59278f14",
		schema: z.object({ verificationCode: z.string(), name: z.string() }),
	},
};

// Extract dynamic template schema types
type TemplateKeys = keyof typeof emailTemplates;
type TemplateData<T extends TemplateKeys> = z.infer<(typeof emailTemplates)[T]["schema"]>;

export const senders: Record<string, MailDataRequired["from"]> = {
	contact: { email: "contact@adventur.ai", name: "AdVentur.ai" },
};

export const sendEmail = async <T extends TemplateKeys>(args: {
	email: string;
	sender: MailDataRequired["from"];
	template: T;
	dynamicTemplateData: TemplateData<T>;
}) => {
	const { email, sender, template, dynamicTemplateData } = args;

	emailTemplates[template].schema.parse(dynamicTemplateData);

	sendgridEmailClient.setApiKey(process.env.SENDGRID_API_KEY!);

	const res = await sendgridEmailClient.send({
		to: email,
		from: sender,
		templateId: emailTemplates[template].id,
		dynamicTemplateData,
	});

	return res;
};
