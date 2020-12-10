'use strict';
require('dotenv').config();
const { directory, region, profile } = process.env;
const AWS = require('aws-sdk');
const credentials = new AWS.SharedIniFileCredentials({ profile });
AWS.config.credentials = credentials;
AWS.config.update({ region });
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const { exec } = require('child_process');

const run = command => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout? stdout : stderr);
        });
    });
}

const getS3Buckets = () => {
    return new Promise((resolve, reject) => {
        s3.listBuckets((error, data) => {
            if (error) {
              reject(error)
            } else {
              resolve(data.Buckets.map(backet => backet.Name));
            }
        });
    });
}

const init = async () => {
    const buckets = await getS3Buckets();

    buckets.forEach(async (bucket) => {
        const command = `aws s3 sync s3://${bucket} ${directory}/${bucket} --profile ${profile} --region ${region} --include="*"`;
        await run(command);
    });
}

init();
