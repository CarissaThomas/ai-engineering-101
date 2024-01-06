// OpenAiService.js
import OpenAI from "openai";

class OpenAiService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPEN_AI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  async chatCompletion(stockData) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: this.createOpenAiRequest(stockData),
      });
        
        console.log(response.choices[0].message.content);

        return response?.choices[0]?.message?.content;

    } catch (error) {
      console.error(error);
    }
  }

  createOpenAiRequest(stockData) {
    var ticker = stockData.ticker;

    let resultString = stockData.results
      .map((result) => JSON.stringify(result))
      .join(",");

    return [
      {
        role: "system",
        content:
          "You are a helpful financial advisor that provides succient and technical summaries of stock ticker data.",
      },
      {
        role: "user",
        content: `Summarize the stock ticker data for ticker ${ticker}.  The data is as follows: ${resultString}`,
      },
    ];
  }
}

export default OpenAiService;
