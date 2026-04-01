const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/api", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.json({ status: false, msg: "No URL" });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://www.instagram.com/"
            }
        });

        const html = response.data;

        let match = html.match(/"video_url":"([^"]+)"/);

        if (!match) {
            match = html.match(/"contentUrl":"([^"]+)"/);
        }

        if (match && match[1]) {
            let videoUrl = match[1]
                .replace(/\\u0026/g, "&")
                .replace(/\\/g, "");

            return res.json({
                status: true,
                video: videoUrl
            });
        }

        res.json({ status: false, msg: "Video not found" });

    } catch (err) {
        res.json({ status: false, msg: err.message });
    }
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
