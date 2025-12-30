app.post(
  "/render",
  upload.fields([{ name: "image", maxCount: 1 }]),
  (req, res) => {
    const title = req.body?.title || "";
    const author = req.body?.author || "";

    if (!req.files || !req.files.image) {
      return res.status(400).send("Image file is required");
    }

    const input = req.files.image[0].path;
    const output = "/tmp/output.png";

    const cmd = `
      convert "${input}" \
        -font DejaVu-Sans-Bold \
        -pointsize 32 \
        -fill black \
        -draw "text 100,90 '${title}'" \
        -font DejaVu-Sans \
        -pointsize 22 \
        -draw "text 100,130 '${author}'" \
        "${output}"
    `;

    exec(cmd, (error) => {
      if (error) {
        return res.status(500).send(error.message);
      }
      res.sendFile(output);
    });
  }
);
