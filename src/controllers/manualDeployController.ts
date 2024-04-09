import { Request,Response, NextFunction } from "express";

import App from "../model/appSchema";
import catchAsync from "../util/catchAsync";
import { createApp } from "../lib/amplify/createApp";
import { createBranch } from "../lib/amplify/createBranch";
import { updateApp } from "../lib/amplify/updateApp";
import { updateBranch } from "../lib/amplify/updateBranch";
import { deleteApp } from "../lib/amplify/deleteApp";
import { createDeployment } from "../lib/amplify/createDeployment";
import { startDeployment } from "../lib/amplify/startDeployment";
import { uploadFile } from "../lib/amplify/uploadFile";
import { getJob } from "../lib/amplify/getJob";

type ManualDeployBody = {
    name:string,
    branchName:string,
    displayName:string
}


export const createAppBranch = catchAsync(async function(req:Request,res:Response,next:NextFunction) {
    const body:ManualDeployBody = req.body;
    console.log(body);

    const appData = await createApp({name:body.name});

    if(!appData){
        console.error("Error Creating App");
        return next();
    }

    const input = {
        branchName: body.branchName,
        appId:appData?.appId,
        displayName:body.displayName
    }

    const branchData = await createBranch(input);
    
    if(!branchData){
        console.error("Error Creating Branch");
        return next();
    }

    const appBranch = await App.create({
        appName: appData.name,
        appId: appData.appId,
        branchName: branchData?.branchName,
        domain: `${req.protocol}://${branchData.displayName}.${appData.appId}.amplifyapp.com`
    })

    res.status(200).json({
        status:"success",
        message: {
            appBranch
        }
    });
});

export const updateAppBranch = catchAsync(async(req:Request,res:Response,next:NextFunction) =>{
    const {id} = req.params;
    const {name,displayName} = req.body;

    if(!id || !name){
        console.error("Id or Body is undefined");
        return next();
    }

    const appBranch = await App.findById(id);

    if(!appBranch){
        console.error("Error finding App");
        return next();
    }

    const appData = await updateApp({appId: appBranch.appId,name});
    
    if(!appData){
        console.error("Error Updating App");
        return next();
    }
    console.log(appData);

    const branchData = await updateBranch({appId:appBranch.appId,branchName:appBranch.branchName,displayName});
    
    if(!branchData){
        console.error("Error Updating Branch");
        return next();
    }
    console.log(branchData);
    
    const updatedAppBranch = await App.findByIdAndUpdate(id,{
        appName: appData.name,
        branchName: branchData.branchName,
        domain: `https://${branchData.displayName}.${appData.appId}.amplifyapp.com`
    },{
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        status:"success",
        message:{
            updatedAppBranch
        }
    });
});

export const deleteAppBranch = catchAsync(async(req:Request,res:Response,next:NextFunction) =>{
    const {id}=req.params;

    if(!id){
        console.error("Id or Body is undefined");
        return next();
    }

    const appBranch = await App.findById(id);

    if(!appBranch){
        console.error("Error finding App");
        return next();
    }

    const appData = await deleteApp({appId:appBranch.appId});
    console.log(appData);

    const deletedAppBranch = await App.findByIdAndDelete(id,{new:true});
    console.log(deletedAppBranch);

    res.status(200).json({
        status:"success"
    });
});

export const deploymentApp = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const {id} = req.params;
    if(!id || !req.files){
        console.error("Id or File are not Found!");
        return next();
    }
    const files = Object.assign({},req.files?.zipFile as any);
    console.log(files);
    const hash:string = files.md5;
    const key = files.name;
    const data:Buffer = files.data;
    console.log(key,hash);

    if(!key || !hash || !data){
        console.error("Key or Hash or Data not Found!");
        return next();
    }

    const appBranch = await App.findById(id);
    if(!appBranch){
        console.error("App is not Found");
        return next();
    }

    const input = {
        appId: appBranch?.appId,
        branchName: appBranch?.branchName,
    }
    
    const deploymentData = await createDeployment(input);
    console.log(deploymentData);

    if(!deploymentData){
        console.error("Error while creating deployment");
        return next();
    }

    const uploadData = await uploadFile(deploymentData,data);

    console.log(uploadData);

    if(uploadData.status !== 200){
        console.error("Error while uploading");
        return next();
    }

    const startDeploymentData = await startDeployment({
        appId:appBranch.appId,
        branchName:appBranch.branchName,
        jobId:deploymentData.jobId
    });

    if(!startDeploymentData){
        console.error("Error start Deployment");
        return next();
    }

    const updatedAppBranch = await App.findByIdAndUpdate(id,{
        jobId:deploymentData.jobId,
        status:startDeploymentData.status,
    },{
        new: true,
        runValidators: true,
    })

    // JobID update in Database App
    res.status(200).json({
        status:"success",
        message:{
            updatedAppBranch
        }
    })
});

export const getAppJob = catchAsync(async(req:Request,res:Response,next:NextFunction) => {
    const {id} = req.params;
    
    if(!id){
        console.error("No Id Found!");
        return next();
    }

    const appBranch = await App.findById(id);

    if(!appBranch){
        console.error("No App Found!");
        return next();
    }

    const input = {
        appId:appBranch.appId,
        branchName: appBranch.branchName,
        jobId:appBranch.jobId!
    }

    const getJobData = await getJob(input);
    console.log(getJobData);

    if(!getJobData){
        console.error("Error getting Job data");
        return next();
    }

    const updatedAppBranch = await App.findByIdAndUpdate(id,{
        status:getJobData.summary?.status,
    },{
        new: true,
        runValidators: true,
    })
    

    const logUrl = getJobData.steps?.at(0)?.logUrl;

    res.status(200).json({
        status:"success",
        message:{
            logUrl,
            updatedAppBranch
        }
    })
});

export const getApp = catchAsync(async(req:Request,res:Response,next:NextFunction) => {
    const {id} = req.params;
    if(!id){
        console.error("No Id Found!");
        return next();
    }
    const appBranch = await App.findById(id);

    res.status(200).json({
        status:"success",
        message:{
            appBranch
        }
    })
});