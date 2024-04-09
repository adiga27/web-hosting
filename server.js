const express = require("express");
require('dotenv').config()
const fs = require('fs');
const path = require('path');   
const crypto = require('crypto');

const { AmplifyClient, CreateAppCommand, CreateBranchCommand, CreateDeploymentCommand, StartDeploymentCommand, GetJobCommand } = require("@aws-sdk/client-amplify")

const app = express();

const amplifyClient = new AmplifyClient({
    region: process.env.W_AWS_REGION ?? "",
    credentials: {
        accessKeyId: process.env.W_AWS_ACCESS_KEY ?? "",
        secretAccessKey: process.env.W_AWS_SECRET_KEY ?? ""
    } 
});
 
const file = bufferFile('./index.html');

function bufferFile(relPath) {
    return fs.readFileSync(path.join(__dirname, relPath),{encoding: 'utf8'}); // zzzz....
}

//d3dp1gl64fkti3
let rContents = '';
let content;

const getHash = ( content ) => {				
    const hash = crypto.createHash('md5');
    const data = hash.update(content, 'utf-8');
    const gen_hash= data.digest('hex');
    return gen_hash;
}

const myReadStream = fs.createReadStream('index.html');

myReadStream.on('data', function(chunk) {
	rContents += chunk;
});
myReadStream.on('error', function(err){
    console.log(err);
});

myReadStream.on('end',function(){
    content = getHash(rContents) ;
    console.log('Content : ' + rContents);
    console.log('Hash : ' + content);
});

const amplifyCreateApp = async (amplifyClient) =>{
    const input = {
        name: "Landing",
        platform: "WEB"
    }
    const command = new CreateAppCommand(input);
    const appData = await amplifyClient.send(command);
    console.log(appData);

    if(appData.$metadata.httpStatusCode !== 200){
        return console.error("Error creating App");
    }
    const {appId} = appData.app

    const branchData = await amplifyCreateBranch(amplifyClient,appId);
    console.log(branchData);

    if(branchData.$metadata.httpStatusCode !== 200){
        return console.error("Error creating Branch");
    }
    const {branchName} = branchData.branch;

    const deploymentData = await amplifyCreateDeployment(amplifyClient,appId,branchName);
    console.log(deploymentData);

    if(deploymentData.$metadata.httpStatusCode !== 200){
        return console.error("Error creating Deployment");
    }
    const {jobId} = deploymentData;

    const requireBody = {
        jobId,
        appId,
        branchName
    }
    const startData = await amplifyStartDeployment(amplifyClient,requireBody);
    console.log(startData);
    
    if(startData.$metadata.httpStatusCode !== 200){
        return console.error("Error creating Starting Deployment");
    }

    const jobData = await amplifyGetJob(amplifyClient,requireBody);
    console.log(jobData.job.summary.status);
    // console.log(jobData.job.steps[0].logUrl);
    console.log("https://"+branchName+"."+appData.app.defaultDomain);
}

amplifyCreateApp(amplifyClient)


const amplifyCreateBranch = async (amplifyClient,appId) => {
    const branchName = "dev" 
    const input = {
        appId : appId,
        branchName: branchName,
    }
    const command = new CreateBranchCommand(input);
    const data = await amplifyClient.send(command);
    return data;
}

const amplifyCreateDeployment = async (amplifyClient,appId,branchName) => {
    const input ={
        appId: appId, 
        branchName: branchName, 
        fileMap: { 
          "index.html": content,
        },
    }
    const command = new CreateDeploymentCommand(input);
    const data = await amplifyClient.send(command);

    await uploadFile(data.fileUploadUrls["index.html"]);

    return data;
}

const uploadFile = async (url) => {
    try{
        const res = await fetch(url,{
            method:"PUT",
            body: file
        })
        const data = await res.json();
        console.log(data);
    }catch(err){
        console.log(err);
    }
}

const amplifyStartDeployment = async (amplifyClient,requireBody)=>{
    const command = new StartDeploymentCommand(requireBody);
    const data = await amplifyClient.send(command);
    return data;
}

const amplifyGetJob = async (amplifyClient,requireBody)=>{
    const command = new GetJobCommand(requireBody);
    const data = await amplifyClient.send(command);
    return data;
}

app.listen(5000,() => {
    console.log("Listening on port 5000")
})