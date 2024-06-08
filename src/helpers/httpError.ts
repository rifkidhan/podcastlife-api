import { ErrorStatus, STATUS_CODE } from "@std/http/status";
import { HTTPException } from "hono/http-exception";

export const errorPodcastApi = (status: ErrorStatus | number) => {
  let message = "invalid parameter from PodcastIndex";
  if (status === STATUS_CODE.Unauthorized) {
    message = "invalid authorization from podcastindex";
    throw new HTTPException(STATUS_CODE.InternalServerError, { message });
  }

  throw new HTTPException(STATUS_CODE.InternalServerError, { message });
};
