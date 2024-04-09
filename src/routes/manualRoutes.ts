import express from 'express'
import fileupload from 'express-fileupload';

import {createAppBranch, deleteAppBranch, deploymentApp, getApp, getAppJob, updateAppBranch} from '../controllers/manualDeployController';

const router = express.Router();

router.post('/createApp',createAppBranch);

router.patch('/updateApp/:id',updateAppBranch);

router.delete('/deleteApp/:id',deleteAppBranch);

router.post('/startDeployment/:id',fileupload(),deploymentApp);

router.get('/getJob/:id',getAppJob);

router.get('/getApp/:id',getApp);

export default router;