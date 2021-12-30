from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import training_model
import predict_model

ALLOWED_EXTENSIONS = {'csv'}

app = Flask(__name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/train-model', methods=['POST'])
def train_model():
    configuration_data = request.get_json()

    return training_model.model(configuration_data['rate'], configuration_data['epoch'])

@app.route('/api/predict-model', methods=['POST'])
def predict_model():
    configuration_data = request.get_json()

    return "OK"

@app.route('/api/file/upload', methods = ['POST'])
def upload_file():
    file = request.files['picture']
    filename = secure_filename(file.filename)
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