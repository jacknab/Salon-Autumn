import { Router, type IRouter } from "express";
import healthRouter from "./health";
import demoRouter from "./demo";
import phonesRouter from "./phones";

const router: IRouter = Router();

router.use(healthRouter);
router.use(demoRouter);
router.use(phonesRouter);

export default router;
