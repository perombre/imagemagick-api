const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/render", upload.single("image"), (req, res) => {
  const { title, author } = req.body;

  if (!req.file) {
    return res.status(400).send("Image file is required");
  }

  const input = req.file.path;
  const output = "/tmp/output.png";

  const cmd = `
    convert "${input}" \
      -font DejaVu-Sans-Bold \
      -pointsize 32 \
      -fill black \
      -draw "text 100,90 '${title || ""}'" \
      -font DejaVu-Sans \
      -pointsize 22 \
      -draw "text 100,130 '${author || ""}'" \
      "${output}"
  `;

  exec(cmd, (error) => {
    if (error) {
      return res.status(500).send(error.message);
    }
    res.sendFile(output);
  });
});

app.get("/health", (req, res) => {
  res.send("ok");
});

app.listen(3000, () => {
  console.log("ImageMagick API running on port 3000");
});
