import { Router } from "oak";
import { getPodcast, getTrending } from "#/routes/podcasts.ts";

export const router = new Router();

router.get("/podcast/:id", getPodcast);
router.get("/trending", getTrending);
