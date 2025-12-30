const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/render", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Image file is required");
  }

  let texts = [];
  try {
    texts = req.body.texts ? JSON.parse(req.body.texts) : [];
  } catch {
    return res.status(400).send("Invalid texts JSON");
  }

  const input = req.file.path;
  const output = `/tmp/output-${Date.now()}.png`;

let currentY = 850;

const drawCommands = texts.map(t => {
  const safeText = (t.text || "").replace(/'/g, "\\'");
  const cmd = `-gravity NorthWest -fill white -stroke black -strokewidth 1 -pointsize ${t.size || 48} -draw "text ${t.x || 200},${currentY} '${safeText}'"`;
  currentY += (t.size || 48) + 20;
  return cmd;
}).join(" ");


  const cmd = `convert "${input}" ${drawCommands} "${output}"`;

  exec(cmd, (error) => {
    if (error) {
      console.error("ImageMagick error:", error.message);
      return res.status(500).send(error.message);
    }

    res.sendFile(output, () => {
      fs.unlink(input, () => {});
      fs.unlink(output, () => {});
    });
  });
});

app.get("/health", (_, res) => res.send("ok"));

app.listen(3000, () => {
  console.log("ImageMagick API running on port 3000");
});
