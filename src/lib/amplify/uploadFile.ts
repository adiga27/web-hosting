import { CreateDeploymentCommandOutput } from "@aws-sdk/client-amplify";

export const uploadFile = async (deploymentData:CreateDeploymentCommandOutput,files:Buffer) => {
    if(deploymentData.zipUploadUrl){
        try{
            // const file =  JSON.stringify(data.toString('utf8'))
            const data = Buffer.from(files);
            const res = await fetch(deploymentData.zipUploadUrl,{
                method:"PUT",
                body: data
            })
            // const respnseData = await res.json();
        }catch(err){
            console.log(err);
            return {status: 400};
        }
        return {status: 200};
    }
    return {status:400}
}

  // if(deploymentData.fileUploadUrls){
    //     for (const [key, url] of Object.entries(deploymentData.fileUploadUrls)) {
    //         const file = bufferFile('../../files/'+ key);
    //         try{
    //             const res = await fetch(url,{
    //                 method:"PUT",
    //                 body: file
    //             })
    //             await res.json();
    //         }catch(err){
    //             console.log(err);
    //             return {status: 400};
    //         }
    //     }
    // }