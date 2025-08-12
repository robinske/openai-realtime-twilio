# OpenAI Realtime Twilio Integration

Real-time voice communication using OpenAI's Realtime API integrated with Twilio for voice-based AI interactions.

Made easy thanks to our friends at OpenAI with the [Agents SDK](https://github.com/openai/openai-agents-js/).

## Overview

This Node.js application creates a veterinary office assistant that can handle phone calls in real-time using OpenAI's Realtime API. When users call your Twilio phone number, they can have natural voice conversations with an AI agent that can help schedule appointments and answer questions.

## Features

- **Real-time Voice AI**: Uses OpenAI's Realtime API for natural voice conversations
- **Twilio Integration**: Handles incoming phone calls through Twilio's telephony services
- **WebSocket Communication**: Streams audio between Twilio and OpenAI in real-time
- **Function Calling**: AI can schedule appointments using custom tools
- **Content Guardrails**: Filters out blocked terms like "diagnosis", "discount", "cure", "refund"
- **Fastify Server**: High-performance web server with WebSocket support

## Prerequisites

- Node.js (v18 or higher)
- OpenAI API key with Realtime API access
- Twilio account with a phone number
- ngrok or similar tool for local development (to expose your local server to Twilio)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd openai-realtime-twilio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
PORT=5050
OPENAI_API_KEY=sk-proj-your-openai-api-key
DEBUG=openai-agents*
```

## Setup

### OpenAI Configuration
1. Ensure you have access to OpenAI's Realtime API
2. Add your API key to the `.env` file

### Twilio Configuration
1. Set up a Twilio phone number
2. Configure the webhook URL for incoming calls to point to `https://your-domain.com/incoming-call`
3. For local development, use ngrok to expose your local server:
```bash
ngrok http 5050
```

## Usage

1. Start the server:
```bash
npm start
```

2. The server will start on the port specified in your `.env` file (default: 5050)

3. Call your Twilio phone number to interact with the AI agent

## API Endpoints

- `GET /` - Health check endpoint
- `POST/GET /incoming-call` - Twilio webhook for handling incoming calls
- `WebSocket /media-stream` - WebSocket endpoint for real-time audio streaming

## Project Structure

```
├── index.js          # Main application file
├── package.json      # Dependencies and scripts
├── .env.example      # Environment variables template
├── .env              # Your environment variables (not tracked)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Customization

### Modify the AI Agent
Edit the agent configuration in `index.js`:
```javascript
const agent = new RealtimeAgent({
  name: "Your Agent Name",
  instructions: "Your custom instructions here",
  tools: [/* your custom tools */],
});
```

### Add Custom Tools
Create new tools for the AI to use:
```javascript
const yourCustomTool = tool({
  name: "your_tool_name",
  description: "Description of what your tool does",
  parameters: z.object({ /* your parameters */ }),
  execute: async (input) => {
    // Your tool logic here
    return "Tool response";
  },
});
```

### Modify Guardrails
Update the content filtering in the `guardrails` array to match your use case.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5050) | No |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `DEBUG` | Debug logging level | No |

## Dependencies

- **@openai/agents**: OpenAI Agents framework
- **@openai/agents-extensions**: Twilio integration extension
- **fastify**: High-performance web framework
- **@fastify/websocket**: WebSocket support for Fastify
- **dotenv**: Environment variable loading
- **zod**: Schema validation

## Troubleshooting

### Common Issues

1. **"Missing OpenAI API key"**: Ensure your `.env` file contains a valid `OPENAI_API_KEY`
2. **WebSocket connection errors**: Check that your ngrok tunnel is active and pointing to the correct port
3. **Twilio webhook errors**: Verify your Twilio webhook URL is correctly configured

### Debug Logging
Enable debug logging by setting the `DEBUG` environment variable:
```
DEBUG=openai-agents*
```
