const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 headers improve
function getHeaders() {
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.instagram.com/",
    };
}

// 🔥 URL clean
function cleanUrl(url) {
    if (url.includes("?")) {
        return url.split("?")[0];
    }
    return url;
}

app.get("/api", async (req, res) => {
    let url = req.query.url;

    if (!url) {
        return res.json({ status: false, msg: "No URL" });
    }

    url = cleanUrl(url);

    try {
        const response = await axios.get(url, {
            headers: getHeaders()
        });

        const html = response.data;

        let videoUrl = null;

        // 🔥 Method 1
        let match1 = html.match(/"video_url":"([^"]+)"/);

        // 🔥 Method 2
        let match2 = html.match(/"contentUrl":"([^"]+)"/);

        // 🔥 Method 3 (meta tag)
        let match3 = html.match(/property="og:video" content="([^"]+)"/);

        if (match1 && match1[1]) {
            videoUrl = match1[1];
        } else if (match2 && match2[1]) {
            videoUrl = match2[1];
        } else if (match3 && match3[1]) {
            videoUrl = match3[1];
        }

        if (videoUrl) {
            videoUrl = videoUrl
                .replace(/\\u0026/g, "&")
                .replace(/\\/g, "");

            return res.json({
                status: true,
                video: videoUrl
            });
        }

        return res.json({
            status: false,
            msg: "Video not found (Instagram changed)"
        });

    } catch (err) {
        return res.json({
            status: false,
            msg: "Error: " + err.message
        });
    }
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
