const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = "https://ekfpageqwbwvwbcoudig.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZnBhZ2Vxd2J3dndiY291ZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NjgzNjgsImV4cCI6MjA1NzM0NDM2OH0.2ZAMOZTraAbn1C_HmpbLf50xOvl6LfoHQ0kjtuBQ-9M";

app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Render proxy server is running!" });
});

// ✅ POST /proxy route
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
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/user_interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        user_id: userId,
        interaction_type: interactionType,
        user_message: message
      }),
    });

    const data = await supabaseRes.json();

    if (!supabaseRes.ok) {
      console.error("Supabase error:", data);
      return res.status(500).json({ error: "Supabase insert failed." });
    }

    res.status(200).json({
      response: data[0].suggested_response || "No suggestion returned.",
      subscriptionPrompt: data[0].subscription_prompt || false,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy server failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
