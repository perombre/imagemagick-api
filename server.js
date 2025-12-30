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
  try {
 texts = req.body.texts
  ? JSON.parse(req.body.texts.trim())
  : [];

  } catch {
    return res.status(400).send("Invalid texts JSON");
  }

  const input = req.file.path;
  const output = `/tmp/output-${Date.now()}.png`;

  // argumentos do ImageMagick
  const args = [input];

  let currentY = 850;

  texts.forEach(t => {
    const text = t.text || "";
    const size = t.size || 48;
    const x = t.x || 120;

    args.push(
      "-gravity", "NorthWest",
      "-font", "Liberation-Sans-Bold",
      "-fill", "white",
      "-stroke", "black",
      "-strokewidth", "1",
      "-pointsize", String(size),
      "-draw", `text ${x},${currentY} '${text}'`
    );

    currentY += size + 20;
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

app.get("/health", (_, res) => res.send("ok"));

app.listen(3000, () => {
  console.log("ImageMagick API running on port 3000");
});
