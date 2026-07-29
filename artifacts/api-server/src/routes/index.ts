import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import seekerRouter from "./seeker";
import companyRouter from "./company";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(seekerRouter);
router.use(companyRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(statsRouter);

export default router;
