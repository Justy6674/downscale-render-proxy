const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase configuration
const SUPABASE_URL = "https://ekfpageqwbwvwbcoudig.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZnBhZ2Vxd2J3dndiY291ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NjgzNjgsImV4cCI6MjA1NzM0NDM2OH0.2ZAMOZTraAbn1C_HmpbLf50xOvl6LfoHQ0kjtuBQ-9M";

app.use(express.json());

// ✅ Root Route - Confirms API is running
app.get("/", (req, res) => {
  res.status(200).json({ message: "Render proxy server is running!" });
});

// ✅ Main Proxy Route - Fetches response from Supabase
app.post("/proxy", async (req, res) => {
  const { message, userId } = req.body;

  let interactionType;
  if (message.toLowerCase().includes("snack")) {
    interactionType = "nutrition_requests";
  } else if (message.toLowerCase().includes("bmi")) {
    interactionType = "body_metrics";
  } else {
    interactionType = "general_query";
  }

  try {
    // Fetch the latest response from Supabase
    const supabaseRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_interactions?user_id=eq.${userId}&interaction_type=eq.${interactionType}&order=created_at.desc&limit=1`,
      {
        method: "GET",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await supabaseRes.json();

    if (!supabaseRes.ok || data.length === 0) {
      console.error("Supabase fetch error:", data);
      return res.status(500).json({ error: "No response found in Supabase." });
    }

    res.status(200).json({
      response: data[0]?.suggested_response || "No suggestion available.",
      subscriptionPrompt: data[0]?.subscription_prompt || false,
    });

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy server failed." });
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
