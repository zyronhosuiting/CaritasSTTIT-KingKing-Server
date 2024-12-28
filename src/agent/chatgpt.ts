/**
 * Placeholder for user configuration.
 * Replace with your actual configuration interface or values.
 */
interface AgentUserConfig {
    OPENAI_API_KEY: string[];
    OPENAI_API_BASE: string;
    OPENAI_CHAT_MODEL: string;
    OPENAI_API_EXTRA_PARAMS?: Record<string, unknown>;
    SYSTEM_INIT_MESSAGE_ROLE?: string;
}

/**
 * Placeholder for chat stream handler type.
 */
type ChatStreamTextHandler = (text: string) => void;

/**
 * History item type representing chat history.
 */
interface HistoryItem {
    role: string;
    content: string;
    images?: string[];
}

/**
 * Parameters for LLM chat requests.
 */
interface LLMChatParams {
    message: string;
    images?: string[];
    prompt?: string;
    history?: HistoryItem[];
}

/**
 * Function to simulate requestChatCompletions.
 * Replace with the actual API call logic if necessary.
 */
async function requestChatCompletions(
    url: string,
    headers: Record<string, string>,
    body: Record<string, unknown>,
    onStream: ChatStreamTextHandler | null
): Promise<string> {
    // Simulate a response for demonstration purposes
    if (onStream) {
        onStream("Streaming response...");
    }
    return "Chat response from OpenAI.";
}

/**
 * Render OpenAI message.
 * Converts history items to a format suitable for the OpenAI API.
 */
async function renderOpenAIMessage(item: HistoryItem): Promise<any> {
    const res: any = {
        role: item.role,
        content: item.content,
    };
    if (item.images && item.images.length > 0) {
        res.content = [];
        if (item.content) {
            res.content.push({ type: 'text', text: item.content });
        }
        for (const image of item.images) {
            res.content.push({ type: 'image_url', image_url: { url: image } });
        }
    }
    return res;
}

/**
 * Base class for OpenAI interactions.
 * Handles API key management and common functionality.
 */
class OpenAIBase {
    readonly name = 'openai';

    /**
     * Selects an API key from the list in a round-robin manner.
     */
    apikey(context: AgentUserConfig): string {
        const length = context.OPENAI_API_KEY.length;
        return context.OPENAI_API_KEY[Math.floor(Math.random() * length)];
    }
}

/**
 * Class for handling GPT-based chat interactions.
 */
class OpenAI extends OpenAIBase {
    readonly modelKey = 'OPENAI_CHAT_MODEL';

    /**
     * Checks if the agent is enabled based on available API keys.
     */
    enable(context: AgentUserConfig): boolean {
        return context.OPENAI_API_KEY.length > 0;
    }

    /**
     * Retrieves the model to be used for chat completions.
     */
    model(context: AgentUserConfig): string {
        return context.OPENAI_CHAT_MODEL;
    }

    /**
     * Renders history items into the OpenAI-compatible format.
     */
    private async render(item: HistoryItem): Promise<any> {
        return renderOpenAIMessage(item);
    }

    /**
     * Sends a request to the OpenAI chat completions endpoint.
     */
    async request(
        params: LLMChatParams,
        context: AgentUserConfig,
        onStream: ChatStreamTextHandler | null
    ): Promise<string> {
        const { message, images, prompt, history } = params;
        const url = `${context.OPENAI_API_BASE}/chat/completions`;
        const header = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apikey(context)}`,
        };

        const messages = [...(history || []), { role: 'user', content: message, images }];
        if (prompt) {
            messages.unshift({ role: context.SYSTEM_INIT_MESSAGE_ROLE || 'system', content: prompt });
        }

        const body = {
            model: context.OPENAI_CHAT_MODEL,
            ...context.OPENAI_API_EXTRA_PARAMS,
            messages: await Promise.all(messages.map((msg) => this.render(msg))),
            stream: onStream != null,
        };

        return requestChatCompletions(url, header, body, onStream);
    }
}

// Example usage
(async () => {
    const agent = new OpenAI();
    const context: AgentUserConfig = {
        OPENAI_API_KEY: ['your-api-key-here'],
        OPENAI_API_BASE: 'https://api.openai.com/v1',
        OPENAI_CHAT_MODEL: 'gpt-3.5-turbo',
    };
    const params: LLMChatParams = {
        message: 'Hello, how are you?',
        history: [{ role: 'user', content: 'Hi there!' }],
    };

    const response = await agent.request(params, context, null);
    console.log(response);
})();
