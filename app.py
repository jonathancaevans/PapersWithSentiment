#Flask imports
from flask import Flask, request, session, render_template, jsonify
from flask_cors import CORS, cross_origin

#scihub api import from local directory
from scihub import *

#Utils imports
import PyPDF2
import io
import os

#Google cloud imports
from google.cloud import language_v1
from google.cloud import vision_v1

#Set up flask app and CORS
app = Flask(__name__, static_url_path="", static_folder="build", template_folder="build")

cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

#Set up credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "googleCloudKey.json"

@app.route("/")
def index():
    """Main Page"""
    return render_template("index.html")

@app.route('/semantify', methods=["POST"])
def semantify():
	sh = SciHub()

	try:
		url = request.json.get("url")

		result = sh.fetch(url)
		p = io.BytesIO(result['pdf']);

		client = vision_v1.ImageAnnotatorClient()
		mime_type = "application/pdf"

		input_config = {"mime_type": mime_type, "content": p.read()}

		features = [{"type_": vision_v1.Feature.Type.DOCUMENT_TEXT_DETECTION}]

		pages = [1, 2, 3, 4, 5]

		requests = [{"input_config": input_config, "features": features, "pages": pages}]

		response = client.batch_annotate_files(requests=requests)

		text_content=''
		for image_response in response.responses[0].responses:
			text_content+=image_response.full_text_annotation.text

		text_content = text_content.replace('\n',' ')

		client = language_v1.LanguageServiceClient()

		type_ = language_v1.Document.Type.PLAIN_TEXT
		document = {"content": text_content, "type_": type_}
		encoding_type = None

		response = client.analyze_sentiment(request = {'document': document, 'encoding_type': encoding_type})

		sentenceSorted = sorted(response.sentences, key=lambda e: abs(e.sentiment.magnitude),reverse=True)

		sentences = []
		for sentence in sentenceSorted:
			sentences.append({"text":sentence.text.content,"score":round(sentence.sentiment.score, 2),"magnitude":round(sentence.sentiment.magnitude, 2)})

	except KeyError:
		return jsonify({"Error": "Can't find pdf for this paper"})
	except:
		print(e)
		return jsonify({"Error": "Misc error"})

	return jsonify({"document":{"score":round(response.document_sentiment.score, 2),"magnitude":round(response.document_sentiment.magnitude, 2)}, "sentences": sentences[:15]})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
