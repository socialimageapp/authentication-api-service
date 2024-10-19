export default class NotFoundError extends Error {
	statusCode: number;
	constructor(message: string) {
		super(message);
		this.statusCode = 404;
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}
