import { createMiddleware } from "hono/helper.ts";
import { HTTPException } from "hono";
import { isErrorStatus, STATUS_CODE, STATUS_TEXT } from "http-status";

export const errorHandler = createMiddleware(async (_c, next) => {
	try {
		await next();
	} catch (error) {
		if (isErrorStatus(error.status)) {
			if (error.status === STATUS_CODE.Unauthorized) {
				throw new HTTPException(STATUS_CODE.Unauthorized, {
					message: STATUS_TEXT[STATUS_CODE.Unauthorized],
				});
			}
			if (error.status === STATUS_CODE.BadGateway) {
				throw new HTTPException(STATUS_CODE.BadGateway, {
					message: STATUS_TEXT[STATUS_CODE.BadGateway],
				});
			}
			if (error.status === STATUS_CODE.BadRequest) {
				throw new HTTPException(STATUS_CODE.BadGateway, {
					message: STATUS_TEXT[STATUS_CODE.BadGateway],
				});
			}
		}
		throw new HTTPException(STATUS_CODE.InternalServerError, {
			message: STATUS_TEXT[STATUS_CODE.InternalServerError],
		});
	}
});
