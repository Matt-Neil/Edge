from flask import Flask, request, send_from_directory, json, make_response
from flask_cors import CORS
import os
import shutil
from zipfile import ZipFile, ZIP_DEFLATED
import training_model
import prediction_model

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http:#localhost:3000"}})

# Predicts a label for an image on a trained model
@app.route('/api/predict-model', methods=['POST'])
def predict_model():
    body = request.form
    file = request.files['image']
    
    # Calls prediction function
    results = make_response(prediction_model.predict(body, file))
    results.headers.add('Access-Control-Allow-Origin', 'http:#localhost:3000')
    results.headers.add('Access-Control-Allow-Credentials', 'true')

    try:
        return results
    except Exception:  
        return "Error", 400

# Trains and saves a model on the parameters specified in the body of the request
@app.route('/api/train-model', methods=['POST'])
def train_model():
    body = request.form
    
    results = make_response(training_model.train(body))
    results.headers.add('Access-Control-Allow-Origin', 'http:#localhost:3000')
    results.headers.add('Access-Control-Allow-Credentials', 'true')

    try:
        return results
    except Exception:  
        return "Error", 400

# Uploads all the images uploaded for the creation of a new dataset
@app.route('/api/file/upload-image', methods = ['POST'])
def upload_images():
    images = request.files.getlist("data[]")
    assignedLabels = request.form.getlist("labels[]")
    # Creates new directory for the dataset
    os.makedirs('datasets/' + request.form['id'])
    # Creates sub-directory for training images in the dataset
    os.makedirs('datasets/' + request.form['id'] + '/images')
    # Creates sub-directory for images with no assigned labels in the dataset
    os.makedirs('datasets/' + request.form['id'] + '/no-label')
    labels = []

    # Creates a sub-directory for each label in the training images sub-directory
    for label in assignedLabels:
        os.makedirs('datasets/' + request.form['id'] + '/images/' + label)

    # Loops through each image uploaded
    for i in range(len(images)):
        # Appends a key-value pair object with the filename and its assigned label as attributes
        labels.append({
            'filename': i,
            'label': assignedLabels[i]
        }) 
        # Saves the uploaded image to its corresponding sub-directory
        images[i].save('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], assignedLabels[i], i))
    
    # Creates labels.json file containing the filename and its assigned label
    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(labels, outfile)

    # Creates a zip file of the dataset
    dataset_zip(request.form['id'], request.form['datasetID'])

    try:
        return "Success"
    except Exception:  
        return "Error", 400

# Delete a specific image in the dataset
@app.route('/api/file/delete-image', methods = ['POST'])
def delete_image():
    # Check if the deleted image has an assigned label
    if request.form['label'] == "No label":
        # Remove image from the no-label sub-directory
        os.remove('datasets/{}/no-label/{}.jpg'.format(request.form['id'], request.form['filename']))
    else:
        # Remove image from the corresponding sub-directory
        os.remove('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['label'], request.form['filename']))

    # Save contents of labels.json file
    with open('datasets/{}/labels.json'.format(request.form['id'])) as infile:
        labels = json.load(infile)

    # Remove image's key-value object from array
    labels.pop(int(request.form['index']))

    # Save updated labels.json file
    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(labels, outfile)

    dataset_zip(request.form['id'], request.form['datasetID'])

    try:
        return "Success"
    except Exception:  
        return "Error", 400

# Replaces all current images in dataset
@app.route('/api/file/replace-image', methods = ['POST'])
def replace_images():
    images = request.files.getlist("data[]")
    assignedLabels = request.form.getlist("labels[]")
    # Deletes whole current dataset directory
    shutil.rmtree('datasets/{}'.format(request.form['id']))
    # Creates new dataset directory
    os.makedirs('datasets/' + request.form['id'])
    # Creates new sub-directory for training images in the dataset
    os.makedirs('datasets/' + request.form['id'] + '/images')
    # Creates new sub-directory for images with no assigned labels in the dataset
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

    try:
        return "Success"
    except Exception:  
        return "Error", 400

# Adds more uploaded images to the dataset
@app.route('/api/file/append-image', methods = ['POST'])
def append_images():
    images = request.files.getlist("data[]")
    filenames = request.form.getlist("filenames[]")
    assignedLabels = request.form.getlist("labels[]")
    labels = []

    with open('datasets/{}/labels.json'.format(request.form['id'])) as infile:
        previous = json.load(infile)
    
    for i in range(len(filenames)):
        # Appends key-value objects for new images to array
        labels.append({
            'filename': filenames[i],
            'label': assignedLabels[i]
        })
        # Adds new images to their corresponding sub-directory
        images[i].save('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], assignedLabels[i], filenames[i]))

    # New image key-value pair objects are appended to existing array in labels.json file
    previous.extend(labels)
    
    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(previous, outfile)

    dataset_zip(request.form['id'], request.form['datasetID'])

    try:
        return "Success"
    except Exception:  
        return "Error", 400

# Defines API endpoint and request method as POST
@app.route('/api/file/update-image', methods = ['POST'])
def update_images():
    # Checks if the image was previously unassigned a label
    if request.form['oldLabel'] == "No label":
        # Moves the image into the new corresponding sub-directory from the no-label sub-directory
        os.rename('datasets/{}/no-label/{}.jpg'.format(request.form['id'], request.form['filename']),
            'datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['newLabel'], request.form['filename']))
    # Checks if the image was newly unassigned a label
    elif request.form['newLabel'] == "No label":
        # Moves the image into the no-label sub-directory from the old sub-directory
        os.rename('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['oldLabel'], request.form['filename']),
            'datasets/{}/no-label/{}.jpg'.format(request.form['id'], request.form['filename']))
    else:
        # Moves the image into the new corresponding sub-directory from the old sub-directory
        os.rename('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['oldLabel'], request.form['filename']),
            'datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['newLabel'], request.form['filename']))

    # Loads the corresponding labels.json file
    with open('datasets/{}/labels.json'.format(request.form['id'])) as infile:
        previous = json.load(infile)
        
    # Updates the relevant assigned label for the image to the new label in the labels.json file
    previous[int(request.form['index'])]['label'] = request.form['newLabel']
    
    # Saves the updated labels.json file
    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(previous, outfile)
        
    # Creates an updated zip file for the dataset
    dataset_zip(request.form['id'], request.form['datasetID'])
    
    try:
        return "Success"
    except Exception:  
        return "Error", 400

# New label is added to dataset
@app.route('/api/file/add-label', methods = ['POST'])
def add_label():
    # Creates new sub-directory in the training images sub-directory
    os.makedirs('datasets/{}/images/{}'.format(request.form['id'], request.form['label']))

    dataset_zip(request.form['id'], request.form['datasetID'])

    try:
        return "Success"
    except Exception:  
        return "Error", 400

# Image is deleted from dataset
@app.route('/api/file/delete-label', methods = ['POST'])
def delete_label():
    with open('datasets/{}/labels.json'.format(request.form['id'])) as infile:
        previous = json.load(infile)
    
    # Loops through images in labels.json file
    for image in previous:
        # Checks if each image's assigned label is the same as the label that is being deleted
        if image['label'] == request.form['label']:
            # Moves image file to no-label sub-directory
            os.rename('datasets/{}/images/{}/{}.jpg'.format(request.form['id'], request.form['label'], image['filename']),
                'datasets/{}/no-label/{}.jpg'.format(request.form['id'], image['filename']))

            # Updates image's assigned label to "No label"
            image['label'] = "No label"

    with open('datasets/{}/labels.json'.format(request.form['id']), 'w') as outfile:
        json.dump(previous, outfile)

    # Sub-directory for label is deleted
    os.rmdir('datasets/{}/images/{}'.format(request.form['id'], request.form['label']))

    dataset_zip(request.form['id'], request.form['datasetID'])
            
    try:
        return "Success"
    except Exception:  
        return "Error", 400

# Delete a whole dataset
@app.route('/api/file/remove-dataset', methods = ['POST'])
def remove_file():
    # Whole dataset directory is deleted
    shutil.rmtree('datasets/{}'.format(request.form['id']))
    
    try:
        return "Success"
    except Exception:  
        return "Error", 400

# Delete a whole workspace
@app.route('/api/file/remove-workspace', methods = ['POST'])
def remove_model():
    # The model directory is deleted
    shutil.rmtree('models/{}'.format(request.form['id']))
    
    try:
        return "Success"
    except Exception:  
        return "Error", 400

# GET request endpoint to send dataset files (images, labels.json and zip files) to front-end
@app.route('/datasets/<path:path>')
def get_labels(path):
    file = send_from_directory('datasets', path)
    file.headers.add('Access-Control-Allow-Origin', 'http:localhost:3000')
    file.headers.add('Access-Control-Allow-Credentials', 'true')

    return file

# GET request endpoint to send model files (zip files) to front-end
@app.route('/models/<path:path>')
def get_model(path):
    file = send_from_directory('models', path)
    file.headers.add('Access-Control-Allow-Origin', 'http:localhost:3000')
    file.headers.add('Access-Control-Allow-Credentials', 'true')

    return file

# Creates zip file for dataset
def dataset_zip(file_id, datasetID):
    # Specifies created zip file location and filename
    with ZipFile("datasets/{}/{}-dataset.zip".format(file_id, datasetID), 'w', ZIP_DEFLATED) as zip_file:
        # Creates zip file starting from the base dataset directory
        for root, dirs, files in os.walk('datasets/{}/images/'.format(file_id)):
            for file in files:
                zip_file.write(os.path.join(root, file))

if __name__ == "__main__":
    app.run(debug=True)