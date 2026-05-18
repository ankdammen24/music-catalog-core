import { z } from "zod"; import { crudRouter } from "./crudFactory";
const create = z.object({ name:z.string().min(1), slug:z.string().min(1), biography:z.string().optional(), country:z.string().optional() });
const patch = create.partial();
export const artistsRouter = crudRouter("artists","artists",create,patch);
