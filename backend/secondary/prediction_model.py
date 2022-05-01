from tensorflow.keras.models import load_model
from keras.preprocessing import image
import numpy as np
from PIL import Image

def predict(body, file):
    labels = sorted(body.getlist("labels[]"))

    # Sets the colour mode of the 
    if body['rgb']:
        color_mode = "RGB"
    else:
        color_mode = "L"

    # Loads saved model from the specified path
    loaded_model = load_model("models/{}/model".format(body['id']), compile = True)

    # Loads the prediction image received in the body of the request
    prediction_image = Image.open(file)
    # Resizes images to the dimensions specified within the dataset
    prediction_image = prediction_image.resize((int(body['width']), int(body['height'])))
    # Convert the image to the colour mode specified
    prediction_image = prediction_image.convert(color_mode)
    # Creates a 3D NumPy array from the image
    prediction_image = image.img_to_array(prediction_image)
    # Inserts a new axis at axis 0
    prediction_image = np.expand_dims(prediction_image, axis=0)

    # Predicts the image label
    prediction = loaded_model.predict(prediction_image)

    # Returns the label that has the highest probability
    return labels[max(range(len(prediction[0])), key=prediction[0].__getitem__)]