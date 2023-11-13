import { createMiddleware } from "hono/helper.ts";
import { HTTPException } from "hono";
import { Status, STATUS_TEXT, isErrorStatus } from "http-status";

export const errorHandler = createMiddleware(async (_c, next) => {
	try {
		await next();
	} catch (error) {
		if (isErrorStatus(error.status)) {
			if (error.status === Status.Unauthorized) {
				throw new HTTPException(Status.Unauthorized, {
					message: STATUS_TEXT[Status.Unauthorized],
				});
			}
			if (error.status === Status.BadGateway) {
				throw new HTTPException(Status.BadGateway, {
					message: STATUS_TEXT[Status.BadGateway],
				});
			}
			if (error.status === Status.BadRequest) {
				throw new HTTPException(Status.BadGateway, {
					message: STATUS_TEXT[Status.BadGateway],
				});
			}
		}
		throw new HTTPException(Status.InternalServerError, {
			message: STATUS_TEXT[Status.InternalServerError],
		});
	}
});
