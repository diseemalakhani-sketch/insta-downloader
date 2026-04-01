const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

function getHeaders() {
    return {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.instagram.com/"
    };
}

// clean URL
function cleanUrl(url) {
    if (url.includes("?")) return url.split("?")[0];
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

        // 🔥 METHOD 1 (og tag)
        let ogMatch = html.match(/property="og:video" content="([^"]+)"/);
        if (ogMatch && ogMatch[1]) {
            videoUrl = ogMatch[1];
        }

        // 🔥 METHOD 2 (NEXT DATA JSON)
        if (!videoUrl) {
            let jsonMatch = html.match(/<script type="application\/json"[^>]*>(.*?)<\/script>/);

            if (jsonMatch && jsonMatch[1]) {
                try {
                    let jsonData = JSON.parse(jsonMatch[1]);

                    // deep search function
                    function findVideo(obj) {
                        if (!obj) return null;

                        if (typeof obj === "object") {
                            for (let key in obj) {
                                if (key === "video_url" && typeof obj[key] === "string") {
                                    return obj[key];
                                }
                                let result = findVideo(obj[key]);
                                if (result) return result;
                            }
                        }
                        return null;
                    }

                    videoUrl = findVideo(jsonData);
                } catch (e) {}
            }
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
            msg: "Video not found (updated Instagram)"
        });

    } catch (err) {
        return res.json({
            status: false,
            msg: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
