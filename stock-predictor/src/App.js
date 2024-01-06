import React, { useState, useEffect } from "react";
import { dates } from "./dates";
import "./App.css";
import loader from "./images/loader.svg";
import OpenAiService from "./services/openAiService";

export default function App() {
  const [tickersArr, setTickersArr] = useState([]);
  const [tickerData, setTickerData] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const openAiService = new OpenAiService();
  const [buttonClicked, setButtonClicked] = useState(false);

  function addTicker(e) {
    e.preventDefault();
    if (textInput.length > 2) {
      setTickersArr([...tickersArr, textInput.toUpperCase()]);
      setButtonClicked(true);
      setTextInput("");
      setTickerData([]);
      setOutput(""); 
    } else {
      setErrorMessage(
        "You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla."
      );
    }
  }

  useEffect(() => {
    if (buttonClicked && tickersArr.length) { // Add check for tickersArr length
      const fetchData = async () => {
        let tempData = {};

        // Use Promise.all to handle multiple asynchronous requests
        const dataPromises = tickersArr.map(ticker =>
          fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`)
            .then(response => response.json())
        );

        const dataResponses = await Promise.all(dataPromises);

        dataResponses.forEach(data => {
          tempData = {...tempData, ...data};
        });

        setTickerData(tempData);
        
        const result = await openAiService.chatCompletion(tempData);
        setOutput(result);
        
        setLoading(false); 
        setButtonClicked(false);
      };

      setErrorMessage("");
      setLoading(true);
      
      fetchData();
    }
  }, [buttonClicked]);


  return (
    <div>
      <header>
        <img
          src="images/logo-dave-text.png"
          alt="Dodgy Dave's Stock Predictions"
        />
      </header>
      <main>
        <section className="action-panel">
          <form id="ticker-input-form" onSubmit={addTicker}>
            <label htmlFor="ticker-input">
              {" "}
              Add up to 3 stock tickers below to get a super accurate stock
              predictions report 👇
            </label>
            <input
              type="text"
              id="ticker-input"
              placeholder="MSFT"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button className="generate-report-btn">Generate Report</button>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {tickersArr.map((ticker, i) => (
              <p key={i}>{ticker}</p>
            ))}
          </form>
        </section>
        {loading && (
          <section className="loading-panel">
            <img src={loader} alt="loading" />
            <div id="api-message">Querying Stocks API...</div>
          </section>
        )}
        {!loading && output && (
          <section className="output-panel">
            <h2>Your Report 😜</h2>
            <p>{output}</p>
          </section>
        )}
      </main>
      <footer>&copy; This is not real financial advice!</footer>
    </div>
  );
}
