import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";
import { z } from "zod";
import { RealtimeAgent, RealtimeSession, tool } from "@openai/agents/realtime";
import { TwilioRealtimeTransportLayer } from "@openai/agents-extensions";

const scheduleAppointmentTool = tool({
  name: "schedule_appointment",
  description: "Schedule an appointment for a given date.",
  parameters: z.object({ date: z.string() }),
  execute: async (input) => {
    return `Appointment scheduled for ${input.date} at 10am`;
  },
});

const guardrails = [
  {
    name: "Blocklist terms",
    async execute({ agentOutput }) {
      const blocklistTerms = ["diagnosis", "discount", "cure", "refund"];
      const blocklistTermsInOutput = blocklistTerms.some((term) =>
        agentOutput.includes(term)
      );
      return {
        tripwireTriggered: blocklistTermsInOutput,
        outputInfo: { blocklistTermsInOutput },
      };
    },
  },
];

// Load environment variables from .env file
dotenv.config();

// Retrieve the OpenAI API key from environment variables. You must have OpenAI Realtime API access.
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  console.error("Missing OpenAI API key. Please set it in the .env file.");
  process.exit(1);
}
const PORT = +(process.env.PORT || 5050);

// Initialize Fastify
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

const agent = new RealtimeAgent({
  name: "Triage Agent",
  instructions: "You are a helpful assistant at a veterinary office.",
  tools: [scheduleAppointmentTool],
});

// Root Route
fastify.get("/", async (request, reply) => {
  reply.send({ message: "Twilio Media Stream Server is running!" });
});

// Route for Twilio to handle incoming and outgoing calls
// <Say> punctuation to improve text-to-speech translation
fastify.all("/incoming-call", async (request, reply) => {
  const twimlResponse = `
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">Thank you for calling Dr. Vet's office! How can I help you today?</Say>
    <Connect>
        <Stream url="wss://${request.headers.host}/media-stream" />
    </Connect>
</Response>`.trim();
  reply.type("text/xml").send(twimlResponse);
});

// WebSocket route for media-stream
fastify.register(async (fastify) => {
  fastify.get("/media-stream", { websocket: true }, async (connection) => {
    try {
      const twilioTransportLayer = new TwilioRealtimeTransportLayer({
        twilioWebSocket: connection,
      });

      const session = new RealtimeSession(agent, {
        transport: twilioTransportLayer,
        outputGuardrails: guardrails,
      });

      await session.connect({
        apiKey: OPENAI_API_KEY,
      });
      console.log("Connected to the OpenAI Realtime API");
    } catch (error) {
      console.error("Error connecting to OpenAI Realtime API:", error);
      connection.close();
    }
  });
});

fastify.listen({ port: PORT }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is listening on port ${PORT}`);
});

process.on("SIGINT", () => {
  fastify.close();
  process.exit(0);
});
