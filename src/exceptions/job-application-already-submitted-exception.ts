import { Exception } from "./exception.js";

export class JobApplicationAlreadySubmittedException extends Exception {
	statusCode = 400;

	constructor() {
		super("Job application was already submitted with this email");
	}
}
