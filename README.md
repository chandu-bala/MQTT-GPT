# MQTT + ChatGPT Integration

This project demonstrates how to integrate **ChatGPT** with the **MQTT protocol** to enable seamless natural language interaction between IoT devices and a conversational AI model.

Using the **OpenAI API**, the MQTT client receives messages from a subscribed topic, sends them to ChatGPT, and publishes the AI-generated responses back to a designated MQTT topic. This enables a continuous interaction cycle between IoT devices and ChatGPT.

---

## 🚀 Features
- Integration of **MQTT protocol** with **ChatGPT**.
- Real-time **message receiving, processing, and delivery**.
- Uses **EMQX** as the MQTT broker.
- **Docker-based setup** for quick installation.
- Example `.env.example` for API key management.

---

## 🛠️ Prerequisites

Before running the project, ensure you have:

- **Docker** installed (for running EMQX).
- **MQTTX Desktop** client (or any MQTT client tool).
- **OpenAI API key** (from [OpenAI](https://platform.openai.com/)).

---

## ⚙️ Setup Instructions

### 1. Install EMQX
You can quickly launch EMQX 5.0 with Docker:

```bash
docker run -d --name emqx \
  -p 1883:1883 -p 8083:8083 \
  -p 8883:8883 -p 8084:8084 \
  -p 18083:18083 emqx/emqx:latest
