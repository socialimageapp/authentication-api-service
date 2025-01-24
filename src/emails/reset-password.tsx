import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Text,
} from "@react-email/components";
import * as React from "react";
import config from "src/configs/api.js";

interface ResetPasswordProps {
	resetLink: string;
	name: string;
}

export const ResetPassword = ({ resetLink, name }: ResetPasswordProps) => (
	<Html>
		<Head />
		<Preview>Here is your password reset link</Preview>
		<Body style={main}>
			<Container style={container}>
				<Heading style={h1}>Reset your password</Heading>
				<Text style={{ ...text, marginBottom: "14px" }}>Hi, {name},</Text>
				<Text style={{ ...text, marginBottom: "14px" }}>
					here is your password reset link for {config.appName}.{" "}
				</Text>
				<a href={resetLink} style={resetPassword}>
					{resetLink}
				</a>
				<Text
					style={{
						...text,
						color: "#ababab",
						marginTop: "14px",
						marginBottom: "16px",
					}}
				>
					If you didn&apos;t try to reset your password, you can safely ignore
					this email.
				</Text>
				<Img
					src={config.business.logo.horizontal}
					width="200"
					height="100"
					style={{ objectFit: "contain" }}
					alt={`${config.appName}'s logo`}
				/>
				<Text style={footer}>
					<Link
						href={config.business.website}
						target="_blank"
						style={{ ...link, color: "#898989" }}
					>
						{config.appName}
					</Link>
					, AI Creatives and Marketing Automation
					<br />
					for your business.
				</Text>
			</Container>
		</Body>
	</Html>
);

export default ResetPassword;

ResetPassword.defaultProps = {
	resetLink: "https://example.com",
	name: "John Doe",
} satisfies ResetPasswordProps;

const main = {
	backgroundColor: "#ffffff",
};

const container = {
	paddingLeft: "12px",
	paddingRight: "12px",
	margin: "0 auto",
};

const h1 = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "24px",
	fontWeight: "bold",
	margin: "40px 0",
	padding: "0",
};

const link = {
	color: "#2754C5",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	textDecoration: "underline",
};

const text = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	margin: "24px 0",
};

const footer = {
	color: "#898989",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "12px",
	lineHeight: "22px",
	marginTop: "12px",
	marginBottom: "24px",
};

const resetPassword = {
	display: "inline-block",
	padding: "16px 4.5%",
	width: "90.5%",
	fontSize: "22px",
	backgroundColor: "#f4f4f4",
	borderRadius: "5px",
	border: "1px solid #eee",
	color: "#333",
};
