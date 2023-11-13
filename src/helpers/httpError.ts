import { ErrorStatus, Status } from "http-status";
import { HTTPException } from "hono";

export const errorPodcastApi = (status: ErrorStatus) => {
  let message = "invalid parameter from PodcastIndex";
  if (status === Status.Unauthorized) {
    message = "invalid authorization from podcastindex";

    throw new HTTPException(Status.InternalServerError, { message });
  }

  throw new HTTPException(Status.InternalServerError, { message });
};
