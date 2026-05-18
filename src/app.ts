import cors from "cors";
import express from "express";
import helmet from "helmet";

import { requireAuth } from "./auth/requireAuth";
import { env } from "./config/env";
import { artistsRouter } from "./routes/artists.routes";
import { healthRouter } from "./routes/health.routes";
import { processingRouter } from "./routes/processing.routes";
import { releasesRouter } from "./routes/releases.routes";
import { tracksRouter } from "./routes/tracks.routes";
import { uploadsRouter } from "./routes/uploads.routes";
import { errorHandler } from "./utils/errors";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use(healthRouter);
app.use(requireAuth);
app.use(artistsRouter);
app.use(releasesRouter);
app.use(tracksRouter);
app.use(uploadsRouter);
app.use(processingRouter);

app.use(errorHandler);
