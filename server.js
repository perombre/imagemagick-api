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

 const drawCommands = texts.map(t => {
  const safeText = (t.text || "TESTE").replace(/'/g, "\\'");
  return `-gravity NorthWest -fill red -stroke white -strokewidth 2 -pointsize 120 -draw "text 200,300 '${safeText}'"`;
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
