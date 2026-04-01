const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

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
        // 🔥 USE WORKING PUBLIC SCRAPER API
        const api = `https://igram.world/api/ig/media?url=${encodeURIComponent(url)}`;

        const response = await axios.get(api);
        const data = response.data;

        if (data && data.items && data.items.length > 0) {
            const videoUrl = data.items[0].url;

            return res.json({
                status: true,
                video: videoUrl
            });
        }

        return res.json({
            status: false,
            msg: "Video not found"
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
