from flask import Flask, request, send_from_directory, json, make_response
from flask_cors import CORS
import os
import shutil
from zipfile import ZipFile, ZIP_DEFLATED
import training_model
import prediction_model

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/api/predict-model', methods=['POST'])
def predict_model():
    body = request.form
    file = request.files['image']
    
    results = make_response(prediction_model.predict(body, file))
    results.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    results.headers.add('Access-Control-Allow-Credentials', 'true')

    try:
        return results
    except Exception:  
        return "Error", 400

@app.route('/api/train-model', methods=['POST'])
def train_model():
    body = request.form
    
    results = make_response(training_model.train(body))
    results.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    results.headers.add('Access-Control-Allow-Credentials', 'true')

    try:
        return results
    except Exception:  
        return "Error", 400

@app.route('/api/file/upload-image', methods = ['POST'])
def upload_images():
    images = request.files.getlist("data[]")
    assignedLabels = request.form.getlist("labels[]")
    os.makedirs('datasets/' + request.form['id'])
    os.makedirs('datasets/' + request.form['id'] + '/images')
    os.makedirs('datasets/' + request.form['id'] + '/no-label')
    labels = []

    for label in assignedLabels:
        os.makedirs('datasets/' + request.form['id'] + '/images/' + label)

    for i in range(len(images)):
        labels.append({
            'filename': i,
            'label': assignedLabels[i]
        }) 
        images[i].save('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], assignedLabels[i], i))
    
    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(labels, outfile)

    dataset_zip(request.form['id'], request.form['datasetID'])

    return "OK"

@app.route('/api/file/delete-image', methods = ['POST'])
def delete_image():
    if request.form['label'] == "No label":
        os.remove('datasets/{}/no-label/{}.jpg'.format(request.form['id'], request.form['filename']))
    else:
        os.remove('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['label'], request.form['filename']))

    with open('datasets/{}/labels.json'.format(request.form['id'])) as infile:
        labels = json.load(infile)

    labels.pop(int(request.form['index']))

    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(labels, outfile)

    dataset_zip(request.form['id'], request.form['datasetID'])

    return "OK"

@app.route('/api/file/replace-image', methods = ['POST'])
def replace_images():
    images = request.files.getlist("data[]")
    assignedLabels = request.form.getlist("labels[]")
    os.remove('datasets/{}'.format(request.form['id']))
    os.makedirs('datasets/' + request.form['id'])
    os.makedirs('datasets/' + request.form['id'] + '/images')
    labels = []

    for label in assignedLabels:
        os.makedirs('datasets/' + request.form['id'] + '/images/' + label)

    for i in range(len(images)):
        labels.append({
            'filename': i,
            'label': assignedLabels[i]
        }) 
        images[i].save('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], assignedLabels[i], i))
    
    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(labels, outfile)

    dataset_zip(request.form['id'], request.form['datasetID'])

    return "OK"

@app.route('/api/file/append-image', methods = ['POST'])
def append_images():
    images = request.files.getlist("data[]")
    filenames = request.form.getlist("filenames[]")
    assignedLabels = request.form.getlist("labels[]")
    labels = []

    with open('datasets/{}/labels.json'.format(request.form['id'])) as infile:
        previous = json.load(infile)
    
    for i in range(len(filenames)):
        labels.append({
            'filename': filenames[i],
            'label': assignedLabels[i]
        })
        images[i].save('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], assignedLabels[i], filenames[i]))

    previous.extend(labels)
    
    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(previous, outfile)

    dataset_zip(request.form['id'], request.form['datasetID'])

    return "OK"

@app.route('/api/file/update-image', methods = ['POST'])
def update_images():
    if request.form['oldLabel'] == "No label":
        os.rename('datasets/{}/no-label/{}.jpg'.format(request.form['id'], request.form['filename']),
            'datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['newLabel'], request.form['filename']))
    elif request.form['newLabel'] == "No label":
        os.rename('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['oldLabel'], request.form['filename']),
            'datasets/{}/no-label/{}.jpg'.format(request.form['id'], request.form['filename']))
    else:
        os.rename('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['oldLabel'], request.form['filename']),
            'datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['newLabel'], request.form['filename']))

    with open('datasets/{}/labels.json'.format(request.form['id'])) as infile:
        previous = json.load(infile)

    previous[int(request.form['index'])]['label'] = request.form['newLabel']
    
    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(previous, outfile)

    dataset_zip(request.form['id'], request.form['datasetID'])

    return "OK"

@app.route('/api/file/add-label', methods = ['POST'])
def add_label():
    os.makedirs('datasets/{}/images/{}'.format(request.form['id'], request.form['label']))

    dataset_zip(request.form['id'], request.form['datasetID'])

    return "OK"

@app.route('/api/file/delete-label', methods = ['POST'])
def delete_label():
    with open('datasets/{}/labels.json'.format(request.form['id'])) as infile:
        previous = json.load(infile)
    
    for image in previous:
        if image['label'] == request.form['label']:
            os.rename('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['label'], image['filename']),
                'datasets/{}/no-label/{}.jpg'.format(request.form['id'], image['filename']))

            image['label'] = "No label"

    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(previous, outfile)

    os.rmdir('datasets/{}/images/{}'.format(request.form['id'], request.form['label']))

    dataset_zip(request.form['id'], request.form['datasetID'])
            
    return "OK"

@app.route('/api/file/remove-dataset', methods = ['POST'])
def remove_file():
    shutil.rmtree('datasets/{}'.format(request.form['id']))
    
    return "OK"

@app.route('/api/file/remove-workspace', methods = ['POST'])
def remove_model():
    shutil.rmtree('models/{}'.format(request.form['id']))
    
    return "OK"

@app.route('/datasets/<path:path>')
def get_labels(path):
    file = send_from_directory('datasets', path)
    file.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    file.headers.add('Access-Control-Allow-Credentials', 'true')

    return file

@app.route('/models/<path:path>')
def get_model(path):
    file = send_from_directory('models', path)
    file.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    file.headers.add('Access-Control-Allow-Credentials', 'true')

    return file

def dataset_zip(file_id, datasetID):
    with ZipFile("datasets/{}/{}-dataset.zip".format(file_id, datasetID), 'w', ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk('datasets/{}/images/'.format(file_id)):
            for file in files:
                zip_file.write(os.path.join(root, file))

if __name__ == "__main__":
    app.run(debug=True)