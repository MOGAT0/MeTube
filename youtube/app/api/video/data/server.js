const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to format time from "00:00:05.123" to "00:05" or "01:23:45"
function formatTimestamp(rawTime) {
    if (!rawTime) return '';
    // Remove milliseconds
    const timeParts = rawTime.split('.')[0].split(':'); // ["00", "01", "23"]
    
    if (timeParts.length === 3) {
        const [hh, mm, ss] = timeParts;
        if (hh === '00') {
            return `${mm}:${ss}`; // Return MM:SS
        }
        return `${hh}:${mm}:${ss}`; // Return HH:MM:SS if video is long
    }
    return rawTime;
}

function parseVttWithTimestamps(vttData) {
    const lines = vttData.split('\n');
    const entries = [];
    let currentStartTime = '';

    // Regex to remove formatting tags like <c.colorE5E5E5>
    const tagRegex = /<[^>]*>/g;

    lines.forEach(line => {
        line = line.trim();

        //Check for timestamp line
        if (line.includes('-->')) {
            const rawStart = line.split('-->')[0].trim();
            currentStartTime = formatTimestamp(rawStart);
        } 
        //Check for text lines (ignore headers, numbers, metadata)
        else if (
            line && 
            !line.startsWith('WEBVTT') && 
            isNaN(line) && 
            !line.startsWith('Kind:') && 
            !line.startsWith('Language:')
        ) {
            const cleanText = line.replace(tagRegex, '').trim();

            if (cleanText) {
                // Logic to handle "rolling" captions (deduplication)
                
                const lastEntry = entries[entries.length - 1];
                
                if (lastEntry) {
                    // Extract just the text part of the last entry
                    const lastText = lastEntry.text;
                    
                    // If the new line contains the previous line, update the previous entry
                    if (cleanText.startsWith(lastText)) {
                        entries[entries.length - 1].text = cleanText;
                    } 
                    // If it's a completely new line, add it
                    else if (cleanText !== lastText) {
                        entries.push({ time: currentStartTime, text: cleanText });
                    }
                } else {
                    entries.push({ time: currentStartTime, text: cleanText });
                }
            }
        }
    });

    // Format the final output as an array of strings
    return entries.map(entry => `${entry.time} - ${entry.text}`);
}

app.get('/get_thumbnail', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Missing "url" query parameter' });
    }

    // --get-thumbnail returns only the URL string to stdout
    const command = `python -m yt_dlp --get-thumbnail "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).json({ error: 'Failed to fetch thumbnail.' });
        }

        const thumbnailUrl = stdout.trim();

        res.json({
            url: videoUrl,
            thumbnail: thumbnailUrl
        });
    });
});

app.get('/transcript', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Missing "url" query parameter' });
    }

    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const outputTemplate = path.join(__dirname, `temp_${fileId}`);
    
    const command = `python -m yt_dlp --skip-download --write-auto-sub --sub-lang en --sub-format vtt --output "${outputTemplate}" "${videoUrl}"`;

    console.log(`Processing: ${videoUrl}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).json({ 
                error: 'Failed to process video. It might not have captions or the URL is invalid.' 
            });
        }

        const expectedFileName = `${outputTemplate}.en.vtt`;

        fs.readFile(expectedFileName, 'utf8', (err, data) => {
            if (err) {
                console.error(`File read error: ${err}`);
                return res.status(404).json({ error: 'Transcript file not found.' });
            }

            fs.unlink(expectedFileName, (unlinkErr) => {
                if (unlinkErr) console.error(`Error deleting temp file: ${unlinkErr}`);
            });

            const formattedTranscript = parseVttWithTimestamps(data);

            res.json({
                url: videoUrl,
                transcript: formattedTranscript
            });
        });
    });
});


app.get('/metadata', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Missing "url" query parameter' });
    }

    const command = `python -m yt_dlp --get-title --get-description "${videoUrl}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).json({ ok:false,error: 'Failed to fetch metadata.' });
        }

        const output = stdout.trim().split('\n');
        const title = output[0];
        const description = output.slice(1).join('\n');

        res.json({
            url: videoUrl,
            title: title,
            description: description
        });
    });
});


const groq = new Groq({
    apiKey: process.env.AI_API_KEY
});

const SYSTEM_PROMPT = `You are a Professional Briefing Assistant. 
Your task is to Analyze the provided Data and extract high-signal information, 
make a note from it highlighing the important. Ignore intros, sponsors, and filler. 
do not use too many unnecessary symbols such as making a table, just plain text like documents.`;

app.post('/v1/analyzer', async (req, res) => {
    try {
        let transcriptData = req.body.data;
        if (!transcriptData) {
            return res.status(400).json({ error: 'Missing "data" in request body' });
        }

        if (Array.isArray(transcriptData)) {
            transcriptData = transcriptData.join('\n');
        }

        console.log("Analyzing content length:", transcriptData.length, "characters");

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: transcriptData }
            ],
            model: process.env.AI_MODEL, 
            temperature: 0.7,
            max_completion_tokens: 8192, 
            stream: false
        });

        const analysis = chatCompletion.choices[0]?.message?.content || "No analysis generated.";

        res.json({
            ok:true,
            success: true,
            analysis: analysis
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});