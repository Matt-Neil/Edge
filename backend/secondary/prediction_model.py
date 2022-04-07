from tensorflow.keras.models import load_model
from keras.preprocessing import image
import numpy as np
from PIL import Image

def predict(body, file):
    labels = sorted(body.getlist("labels[]"))

    if body['rgb']:
        color_mode = "RGB"
    else:
        color_mode = "L"

    loaded_model = load_model("models/{}".format(body['id']), compile = True)

    prediction_image = Image.open(file)
    prediction_image = prediction_image.resize((int(body['width']), int(body['height'])))
    prediction_image = prediction_image.convert(color_mode)
    prediction_image = image.img_to_array(prediction_image)
    prediction_image = np.expand_dims(prediction_image, axis=0)

    prediction = loaded_model.predict(prediction_image)

    return labels[max(range(len(prediction[0])), key=prediction[0].__getitem__)]