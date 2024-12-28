import OpenAI from "openai";

export const chatController = async (c: any) => {
  // Ensure the request method is POST
  if (c.req.method !== "POST") {
    return c.json(
      { error: "Method not allowed. Only POST requests are accepted." },
      405
    );
  }

  // Parse the JSON body and validate it contains a `message` property
  let requestData;

  try {
    requestData = await c.req.json();
  } catch (error) {
    return c.json({ error: "Invalid JSON body." }, 400);
  }

  const { message } = requestData;
  if (!message || typeof message !== "string") {
    return c.json(
      {
        error:
          "Bad Request. The body must contain a 'message' property of type string.",
      },
      400
    );
  }

  const openai = new OpenAI({
    apiKey: c.env.CHATGPT_AI_TOKEN, // Access environment variable here
  });

  const prompt =
    "你是一名名為 Kinging 的聊天機器人，為香港明愛服務。你喜歡與人交談，並樂於幫助人們解決需求。請以繁體中文回答。";

  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
        { role: "user", content: message },
      ],
      model: "gpt-4o-mini", // Select the appropriate model
    });

    return c.json({ response: response.choices[0]?.message?.content });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch response from OpenAI." }, 500);
  }
};
