const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const formidable = require("formidable");
const fs = require("fs");
const { google } = require("googleapis");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "1mb" }));
app.use(cors());

app.get("/hello", (req, res) => {
  return res.status(200).send("Hello World");
});

app.post(
  "/upload",
  (req, res, next) => {
    // validate password
    if (!req.headers) {
      return res.status(401).json({ message: "Missing password" });
    }
    if (req.headers.password !== "password") {
      return res.status(401).json({ message: "Invalid password" });
    }
    next();
  },
  (req, res) => {
    const options = {
      filter: function ({ name, originalFilename, mimetype }) {
        // keep only images
        return mimetype && mimetype.includes("image");
      },
    };
    const form = new formidable.IncomingForm(options);

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log("err :>> ", err);
        return res
          .status(500)
          .json({
            message: "An error occurred uploading your files",
            error: err,
          });
      }

      console.log("files :>> ", files);

      const uploadedFiles = files["files"];
      console.log("uploadedFiles :>> ", uploadedFiles);
      if (!Array.isArray(uploadedFiles)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      try {
        const authClient = await authorize();
        const uploadPromises = uploadedFiles.map((file) => {
          const filePath = file.filepath;
          const fileName = file.originalFilename;
          const newFileName = `${Date.now()}_${fileName}`;
          return uploadFile(authClient, filePath, newFileName);
        });

        const fileIds = await Promise.all(uploadPromises);
        return res
          .status(200)
          .json({ message: "Files uploaded successfully", fileIds });
      } catch (error) {
        console.log("error :>> ", error);
        return res
          .status(500)
          .json({
            message: "An error occurred uploading to Google Drive",
            error,
          });
      }
    });
  }
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Load service account key
const pkey = require("./pk.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Authorize with service account and get jwt client
async function authorize() {
  const jwtClient = new google.auth.JWT(
    pkey.client_email,
    null,
    pkey.private_key,
    SCOPES
  );
  await jwtClient.authorize();
  return jwtClient;
}

// Create a new file on Google Drive
async function uploadFile(authClient, filePath, fileName) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const fileMetadata = {
    name: fileName,
    parents: ["1XmNG37DVX5FA5lDggGuA5dbU2Ql24EZe"],
  };
  const media = {
    mimeType: "image/jpeg", // Adjust if you're accepting other image types
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id",
  });
  return response.data.id;
}
