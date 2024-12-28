import OpenAI from "openai";

export const chatController = async (c: any) => {
  // const client = new OpenAI({
  //   apiKey: API_KEY, // Ensure API_KEY is imported or accessible
  // });
  // You can add logic to handle input and return a response
  return c.text("Chat endpoint logic here!");
};
