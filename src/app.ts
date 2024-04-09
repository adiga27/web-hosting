import express from 'express'

import manualRoutes from './routes/manualRoutes'

const app = express();

app.use(express.json());

app.use("/api/v1/manualDeploy",manualRoutes);
// app.use("/api/v1/git-deploy");


export default app;