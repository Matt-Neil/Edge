from flask import Flask, request, jsonify, send_from_directory
import os
import training_model
import prediction_model
import test

ALLOWED_EXTENSIONS = {'csv'}

app = Flask(__name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/predict-model')
def predict_model():
    return prediction_model.model()

@app.route('/api/train-model')
def train_model():

    return training_model.model()

@app.route('/api/test')
def test_model():

    return test.model()

# @app.route('/api/predict-model', methods=['POST'])
# def prediction_model():
#     configuration_data = request.get_json()

#     return "OK"

@app.route('/api/file/upload', methods = ['POST'])
def upload_file():
    file = request.files['data']
    filename = request.form['id'] + ".csv"
    file.save('files/' + filename)

    return "OK"

@app.route('/api/file/remove')
def remove_file():
    os.remove('files/file.csv')
    
    return "OK"

@app.route('/files/<path:path>')
def get_data(path):
    file = send_from_directory('files', path)
    file.headers.add('Access-Control-Allow-Origin', '*')

    return file

if __name__ == "__main__":
    app.run(debug=True)