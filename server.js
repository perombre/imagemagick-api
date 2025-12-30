const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/render", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Image file is required");
  }

  let texts = [];
  if (req.body.texts) {
    try {
      texts = JSON.parse(req.body.texts);
    } catch (e) {
      return res.status(400).send("Invalid texts JSON");
    }
  }

  const input = req.file.path;
  const output = `/tmp/output-${Date.now()}.png`;

  // argumentos do ImageMagick como ARRAY (sem shell)
  const args = [input];

  texts.forEach(t => {
    args.push(
      "-font", t.font || "DejaVu-Sans",
      "-pointsize", String(t.size || 24),
      "-fill", t.color || "black",
      "-draw", `text ${t.x || 0},${t.y || 0} ${t.text || ""}`
    );
  });

  args.push(output);

  execFile("convert", args, (error) => {
    if (error) {
      console.error("ImageMagick error:", error);
      return res.status(500).send(error.message);
    }

    res.sendFile(output, () => {
      fs.unlink(input, () => {});
      fs.unlink(output, () => {});
    });
  });
});

app.get("/health", (req, res) => res.send("ok"));

app.listen(3000, () => {
  console.log("ImageMagick API running on port 3000");
});
