export default class AppError extends Error {
	statusCode: number;
	type: string;
	constructor(message: string, statusCode: number, type: string) {
		super(message);
		this.statusCode = statusCode;
		this.name = this.constructor.name;
		this.type = type;
		Error.captureStackTrace(this, this.constructor);
	}
}
