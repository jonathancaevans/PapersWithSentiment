import './App.css';
import React, {useRef, useEffect, useState, Fragment} from 'react';

import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from "react-toastify";

function App() {

  const [url, setUrl] = useState(null);

  const [document, setDocument] = useState(null);
  const [sentences, setSentences] = useState([]);

  const [loading, setLoading] = useState(false);

  function handleURLChange(e) {
  	setUrl(e.target.value);
  }

  const semantify = async(e) => {
  	if(url == null || url == ''){
		return
	}

	setLoading(true);

	const res = await fetch('/semantify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			},
		body: JSON.stringify({'url': url})
	});

	const body = await res.json();

	setLoading(false);

	if(body['Error'] != null){
		toast.warn(body['Error'])
	}
	else{
                setDocument(body['document'])
		setSentences(body['sentences']);
	}
  }

  return (
    <div className="App">
      <header className="App-header">
        <ToastContainer position="top-right" autoClose={1400} closeOnClick={false} draggable={false} pauseOnHover/>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous"/>
      </header>

      <div class="container mt-2">
        <div class="row">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Papers with Sentiment</h5>
              <p class="card-text">Papers with Sentiment uses Google's NLP sentiment analysis API to output the sentiment of scientific articles. Any scientific paper in PDF format available through Sci-Hub can be analyzed just by pasting in the link to the paper paywall! A positive or more positive score represents positive emotion while a negative score represents negative emotion. Angry and sad are examples of negative emotions while happy and glad would be examples of positive emotion. Magnitude represents how much emotional content is present.</p>

              <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Paper URL" onChange={handleURLChange}/>
                <button class="btn btn-outline-info" type="button" onClick={semantify} disabled={loading}>Semantify!</button>
              </div>
            </div>
            <ul class="list-group list-group-flush">
              {loading === false && document != null && <li class="list-group-item">
                <div>
                  <h6 class="fa">Overall Document</h6>
                </div>
                <span class="badge bg-success">Score: {document["score"]}</span>
                <span class="badge bg-success">magnitude: {document["magnitude"]}</span>
              </li>}

              {loading ?
              <li class="list-group-item placeholder-glow">Loading...</li>
              :
              sentences.map(function(sentence, i){
		if(sentence["score"] > 0){
                  return <li class="list-group-item">
                           <div>
                             <p class="fa">{sentence["text"]}</p>
                           </div>
                           <span class="badge bg-success">Score: {sentence["score"]}</span>
                           <span class="badge bg-secondary">Magnitude: {sentence["magnitude"]}</span>
                         </li>;
                }
                else{
                  return <li class="list-group-item">
                           <div>
                             <p class="fa">{sentence["text"]}</p>
                           </div>
                           <span class="badge bg-danger">Score: {sentence["score"]}</span>
                           <span class="badge bg-secondary">Magnitude: {sentence["magnitude"]}</span>
                         </li>;
		}
              }
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
