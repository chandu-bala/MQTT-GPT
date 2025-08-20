// require("dotenv").config();
// const axios = require("axios");
// const mqtt = require("mqtt");

// // Load Gemini API Key from environment variables
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// let messages = {}; // Store conversation history
// const maxMessageCount = 10;

// // Axios instance for Gemini API
// const http = axios.create({
//   baseURL: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
//   headers: { "Content-Type": "application/json" },
// });

// const host = "127.0.0.1";
// const port = "1883";
// const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

// const OPTIONS = {
//   clientId,
//   clean: true,
//   connectTimeout: 4000,
//   username: "roger",
//   password: "roger",
//   reconnectPeriod: 1000,
// };

// const connectUrl = `mqtt://${host}:${port}`;
// const chatReqTopic = "gemini/request/#"; // Wildcard subscription for multiple users
// const client = mqtt.connect(connectUrl, OPTIONS);

// client.on("connect", () => {
//   console.log(`${host}, Connected`);
//   client.subscribe(chatReqTopic, () => {
//     console.log(`${host}, Subscribed to topics with prefix 'gemini/request/'`);
//   });
// });

// client.on("message", (topic, payload) => {
//   try {
//     const msgStr = payload.toString();
//     let userMessage;

//     // Try parsing as JSON, otherwise treat as plain text
//     try {
//       const msgObj = JSON.parse(msgStr);
//       if (msgObj && msgObj.msg) {
//         userMessage = msgObj.msg; // Extract "msg" field from JSON
//       } else {
//         throw new Error("Invalid JSON structure");
//       }
//     } catch (jsonError) {
//       userMessage = msgStr; // Fallback to plain text if JSON parsing fails
//     }

//     console.log("Received Message:", topic, userMessage);

//     const userId = topic.replace("gemini/request/", "");
//     messages[userId] = messages[userId] || [];
//     messages[userId].push({ role: "user", content: userMessage });

//     if (messages[userId].length > maxMessageCount) {
//       messages[userId].shift(); // Remove oldest message
//     }

//     // Generate response using Gemini API
//     genText(userId);
//   } catch (error) {
//     console.error("Message Handling Error:", error.message);
//     client.publish(topic.replace("request", "response"), JSON.stringify({ error: "Failed to process message" }));
//   }
// });

// const genText = async (userId) => {
//   try {
//     const requestBody = {
//       contents: [{ parts: messages[userId].map(msg => ({ text: msg.content })) }],
//       generationConfig: { maxOutputTokens: 150 },
//     };

//     const { data } = await http.post(`?key=${GEMINI_API_KEY}`, requestBody);

//     if (data.candidates && data.candidates.length > 0) {
//       const content = data.candidates[0].content.parts[0].text;
//       console.log(`Response for ${userId}:`, content);

//       messages[userId].push({ role: "assistant", content });

//       if (messages[userId].length > maxMessageCount) {
//         messages[userId].shift();
//       }

//       const replyTopic = `gemini/response/${userId}`;
//       client.publish(replyTopic, JSON.stringify({ reply: content }), { qos: 0, retain: false });
//     } else {
//       console.log("Empty response from Gemini API");
//       client.publish(`gemini/response/${userId}`, JSON.stringify({ error: "No response from AI" }));
//     }
//   } catch (e) {
//     console.error("Error in AI response:", e.message);
//     client.publish(`gemini/response/${userId}`, JSON.stringify({ error: "Failed to process request" }));
//   }
// };


















require("dotenv").config();
const axios = require("axios");
const mqtt = require("mqtt");

// Load Gemini API Key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let messages = {}; // Store conversation history  
const maxMessageCount = 10;

// Axios instance for Gemini API
const http = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
  headers: { "Content-Type": "application/json" },
});

const host = "127.0.0.1";
const port = "1883";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const OPTIONS = {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: "roger",
  password: "roger",
  reconnectPeriod: 1000,
};

const connectUrl = `mqtt://${host}:${port}`;
const chatReqTopic = "gemini/request/#"; // Wildcard subscription for multiple users
const client = mqtt.connect(connectUrl, OPTIONS);

client.on("connect", () => {
  console.log(`✅ ${host}, Connected`);
  client.subscribe(chatReqTopic, () => {
    console.log(`📡 ${host}, Subscribed to topics with prefix 'gemini/request/'`);
  });
});

client.on("message", (topic, payload) => {
  try {
    const msgStr = payload.toString();
    let userMessage;

    // Try parsing as JSON, otherwise treat as plain text
    try {
      const msgObj = JSON.parse(msgStr);
      if (msgObj && msgObj.msg) {
        userMessage = msgObj.msg; // Extract "msg" field from JSON
      } else {
        throw new Error("❌ Invalid JSON structure");
      }
    } catch (jsonError) {
      console.warn("⚠️ JSON Parsing Failed, treating as plain text");
      userMessage = msgStr; // Fallback to plain text if JSON parsing fails
    }

    console.log("📩 Received Message:", topic, userMessage);

    const userId = topic.replace("gemini/request/", "");
    messages[userId] = messages[userId] || [];
    messages[userId].push({ role: "user", content: userMessage });

    if (messages[userId].length > maxMessageCount) {
      messages[userId].shift(); // Remove oldest message
    }

    // Generate response using Gemini API
    genText(userId);
  } catch (error) {
    console.error("🚨 Message Handling Error:", error.message);
    client.publish(topic.replace("request", "response"), JSON.stringify({ error: "Failed to process message" }));
  }
});

const genText = async (userId) => {
  try {
    const requestBody = {
      contents: [{ parts: messages[userId].map(msg => ({ text: msg.content })) }],
      generationConfig: { maxOutputTokens: 150 },
    };

    const { data } = await http.post(`?key=${GEMINI_API_KEY}`, requestBody);

    if (data.candidates && data.candidates.length > 0) {
      const content = data.candidates[0].content.parts[0].text;
      console.log(`🤖 Response for ${userId}:`, content);

      messages[userId].push({ role: "assistant", content });

      if (messages[userId].length > maxMessageCount) {
        messages[userId].shift();
      }

      const replyTopic = `gemini/response/${userId}`;
      client.publish(replyTopic, JSON.stringify({ reply: content }), { qos: 0, retain: false });
    } else {
      console.log("⚠️ Empty response from Gemini API");
      client.publish(`gemini/response/${userId}`, JSON.stringify({ error: "No response from AI" }));
    }
  } catch (e) {
    console.error("🔥 Error in AI response:", e.message);
    client.publish(`gemini/response/${userId}`, JSON.stringify({ error: "Failed to process request" }));
  }
};

