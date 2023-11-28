const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { ACCESS_KEY, SECRET_KEY, BUCKET_NAME, REGION, PORT } = process.env;
const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  console.log("OK");
  res.send("OK");
});

const S3 = require("aws-sdk/clients/s3");
const { randomUUID } = require("crypto");

const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: REGION,
  signatureVersion: "v4",
});

app.get("/getPresignUrl", async (req, res) => {
  try {
    const fileType = req.query.fileType || "";
    const ex = fileType.split(".")[1];
    console.log(ex);
    const Key = `${randomUUID()}.${ex}`;
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key,
      Expires: 600,
      ContentType: `image/${ex}`,
    };
    const uploadUrl = await s3.getSignedUrl("putObject", s3Params);

    // console.log("uploadUrl ***********************", uploadUrl);
    res.status(200).json({
      uploadUrl,
      key: Key,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

app.delete("/delete", async (req, res) => {
  try {
    const key = req.query.key || "";
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    if(!key){
        throw {
            message:"Provide the key",
            statusCode:400
        }
    }
    await s3.deleteObject(deleteParams).promise();

    res.status(200).json({
      message: "Object deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`server is running over ${PORT}`);
});
