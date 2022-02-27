from flask import Flask, request, jsonify, send_from_directory, json, make_response
from flask_cors import CORS
import os
import training_model
import prediction_model
import test
import sys

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/api/predict-model')
def predict_model():
    return prediction_model.model()

@app.route('/api/train-model', methods=['POST'])
def train_model():
    body = request.form
    
    results = make_response(training_model.model(body))
    results.headers.add('Access-Control-Allow-Origin', '*')
    return results

@app.route('/api/test', methods=['POST'])
def test_model():

    return test.model()

# @app.route('/api/predict-model', methods=['POST'])
# def prediction_model():
#     configuration_data = request.get_json()

#     return "OK"

@app.route('/api/file/upload', methods = ['POST'])
def upload_file():
    if request.form['type'] == "image":
        images = request.files.getlist("data[]")
        assignedLabels = request.form.getlist("labels[]")
        os.makedirs('files/' + request.form['id'])
        labels = []

        for i in range(len(images)):
            labels.append({
                'filename': i,
                'label': assignedLabels[i]
            })
            images[i].save('files/{}/{}.jpg'.format(request.form['id'], i))
        
        with open('files/{}/labels.json'.format(request.form['id']), 'w') as outfile:
            json.dump(labels, outfile)
    else:
        file = request.files['data']
        filename = request.form['id'] + ".csv"
        file.save('files/' + filename)

    return "OK"

@app.route('/api/file/remove', methods = ['POST'])
def remove_file():
    if request.form['type'] == "image":
        os.remove('files/{}'.format(request.form['id']))
    else:
        os.remove('files/{}.csv'.format(request.form['id']))
    
    return "OK"

@app.route('/files/<path:path>')
def get_data(path):
    file = send_from_directory('files', path)
    file.headers.add('Access-Control-Allow-Origin', '*')

    return file

if __name__ == "__main__":
    app.run(debug=True)