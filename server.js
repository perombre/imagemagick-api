const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");

const app = express();
const upload = multer({ dest: "/tmp" });

app.get("/", (req, res) => {
  res.send("ImageMagick API is running");
});

app.get("/health", (req, res) => {
  res.send("ok");
});

app.post(
  "/render",
  upload.fields([{ name: "image", maxCount: 1 }]),
  (req, res) => {
    if (!req.files || !req.files.image) {
      return res.status(400).send("Image file is required");
    }

    let texts = [];
    try {
      texts = JSON.parse(req.body.texts || "[]");
    } catch (e) {
      return res.status(400).send("Invalid texts JSON");
    }

    const input = req.files.image[0].path;
    const output = "/tmp/output.png";

    let drawCommands = "";

    texts.forEach((t) => {
      const text = (t.text || "").replace(/"/g, '\\"');
      const x = t.x || 0;
      const y = t.y || 0;
      const font = t.font || "DejaVu-Sans";
      const size = t.size || 24;
      const color = t.color || "black";

      drawCommands += `
        -font ${font}
        -pointsize ${size}
        -fill ${color}
        -draw "text ${x},${y} '${text}'"
      `;
    });

    const cmd = `
      convert "${input}" \
      ${drawCommands}
      "${output}"
    `;

    exec(cmd, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send(error.message);
      }
      res.sendFile(output);
    });
  }
);

app.listen(3000, () => {
  console.log("ImageMagick API running on port 3000");
});
