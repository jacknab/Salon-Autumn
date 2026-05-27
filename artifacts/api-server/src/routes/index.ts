import { Router, type IRouter } from "express";
import healthRouter from "./health";
import demoRouter from "./demo";
import phonesRouter from "./phones";
import packagesRouter from "./packages";
import businessesRouter from "./businesses";
import callsRouter from "./calls";
import analyticsRouter from "./analytics";
import webhooksRouter from "./webhooks";
import billingRouter from "./billing";
import stripeWebhookRouter from "./stripe-webhook";

const router: IRouter = Router();

router.use(healthRouter);
router.use(demoRouter);
router.use(phonesRouter);
router.use(packagesRouter);
router.use(businessesRouter);
router.use(callsRouter);
router.use(analyticsRouter);
router.use(webhooksRouter);
router.use(billingRouter);
router.use(stripeWebhookRouter);

export default router;
