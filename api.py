import flask
import uuid
import json
from flask import request, url_for
from db import couch, vote_view
from cloudant.document import Document

app = flask.Flask(__name__)

@app.route('/', methods=['GET'])
def index():
   return app.send_static_file('index.html')

@app.route('/create', methods=['POST'])
def create():
   data = request.get_json()
   data['_id'] = str(uuid.uuid4())
   doc = couch.create_document(data)
   return doc['_id'], 201

@app.route('/poll/<poll_id>', methods=['GET', 'POST'])
def read(poll_id):
   if request.method == 'GET':
      doc = Document(couch, poll_id)
      doc.fetch()
      return doc.json()
   if request.method == 'POST':
      data = request.get_json()
      data['pollID'] = poll_id
      data['remote_addr'] = request.remote_addr
      data['user_agent'] = request.headers.get('User-Agent')
      doc = couch.create_document(data)
      return doc['_id'], 201

@app.route('/results/<poll_id>', methods=['GET'])
def results(poll_id):
    results = {}
    for row in vote_view(key=poll_id)['rows']:
       for key in row['value']['votes']:
           if key in results:
              results[key] += 1
           else:
              results[key] = 1

    return json.dumps(results)

app.run(debug=False, host='0.0.0.0')
