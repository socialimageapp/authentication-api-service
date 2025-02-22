import { SES, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import { z } from "zod";
import { ConfirmationCode } from "src/emails/confirmation-code.js";
import { ResetPassword } from "src/emails/reset-password.js";
const sesClient = new SES({ region: process.env.AWS_REGION || "us-east-1" });

export const emailTemplates = {
	cancel: {
		id: "d-331456d5eb3f48a9867de8f953dcfb7d",
		subject: "Your subscription has been cancelled",
		schema: z.object({ name: z.string() }),
	},
	pause: {
		id: "d-015d2b382b5d4d41bc99406fdf8a7460",
		subject: "Your account has been paused",
		schema: z.object({ name: z.string() }),
	},
	welcome: {
		id: "d-b6c15d3fbf2f4724a08d1d9bd85456f6",
		subject: "Welcome to AdVentur.ai",
		schema: z.object({ name: z.string() }),
	},
	creditReset: {
		id: "d-15260d8e27e045a9a8f2fe51b6bfdd45",
		subject: "Your credits have been reset",
		schema: z.object({ name: z.string() }),
	},
	trialExpired: {
		id: "d-3bbeb7752f714960b6520077f7b924ff",
		subject: "Your trial has expired",
		schema: z.object({ name: z.string() }),
	},
	scheduledPosts: {
		id: "d-1f1092b27b2e475e9ae18c5ef5d687c0",
		subject: "Your scheduled posts are ready",
		schema: z.object({ name: z.string() }),
	},
	undoCancel: {
		id: "d-98efa9cbc6e94ce99293468442ad8f4b",
		subject: "Your account is active again",
		schema: z.object({ name: z.string() }),
	},
	confirmEmail: {
		id: "d-29c40aa6582d40df85535c6b59278f14",
		subject: " your email",
		schema: z.object({ verificationCode: z.string(), name: z.string() }),
	},
	verifyAccount: {
		id: "d-29c40aa6582d40df85535c6b59278f14",
		subject: "Verify your account",
		schema: z.object({ verificationCode: z.string(), name: z.string() }),
	},
	resetPassword: {
		id: "d-29c40aa6582d40df85535c6b59278f14",
		subject: "Reset your password",
		schema: z.object({ resetLink: z.string(), name: z.string() }),
	},
} as const;

export type EmailTemplateKey = keyof typeof emailTemplates;

export type EmailTemplateData<T extends EmailTemplateKey> = z.infer<
	(typeof emailTemplates)[T]["schema"]
>;

export const senders = {
	contact: { email: "contact@adventur.ai", name: "AdVentur.ai" },
};
export type EmailArgs = {
	email: string;
	sender: (typeof senders)[keyof typeof senders];
} & {
	[K in EmailTemplateKey]: {
		template: K;
		subject?: string | undefined;
		dynamicTemplateData: EmailTemplateData<K>;
	};
}[EmailTemplateKey];

const getEmailHTML = async (args: EmailArgs): Promise<{ text: string; html: string }> => {
	const { template, dynamicTemplateData } = args;
	if (template === "confirmEmail") {
		const Component = ConfirmationCode;
		const text = await render(
			<Component
				{...dynamicTemplateData}
				code={dynamicTemplateData.verificationCode}
				type="register"
			/>,
			{ plainText: true },
		);
		const html = await render(
			<Component
				{...(dynamicTemplateData as any)}
				code={dynamicTemplateData.verificationCode}
				type="register"
			/>,
		);
		return { text, html };
	}
	if (template === "resetPassword") {
		const Component = ResetPassword;
		const text = await render(<Component {...dynamicTemplateData} />, {
			plainText: true,
		});
		const html = await render(<Component {...dynamicTemplateData} />);
		return { text, html };
	}
	return { text: "", html: "" };
};

export const sendEmail = async (args: EmailArgs) => {
	if (process.env.MODE === "development") {
		console.log("Email not sent in development mode");
		return;
	}
	const { email, sender, subject, template } = args;
	const emailTemplate = emailTemplates[template];
	console.log("emailTemplate", emailTemplate);
	const { html, text } = await getEmailHTML(args);
	console.log(args);
	const params: SendEmailCommandInput = {
		Source: `${sender.name} <${sender.email}>`,
		Destination: { ToAddresses: [email] },
		Message: {
			Body: {
				Html: { Charset: "UTF-8", Data: html },
				Text: { Charset: "UTF-8", Data: text },
			},
			Subject: { Charset: "UTF-8", Data: subject ?? emailTemplate.subject },
		},
	};
	try {
		const res = await sesClient.sendEmail(params);
		console.log("Email sent successfully:", res);
		return res;
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
};
