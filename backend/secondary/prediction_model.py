from tensorflow.keras.models import load_model
from skimage import transform
import numpy as np
import sys
from keras.preprocessing import image

def predict(body, file):
    if body['rgb']:
        channels = 3
    else:
        channels = 1

    loaded_model = load_model("models/{}".format(body['id']), compile = True)

    prediction_image = image.load_img('prediction/bird.png', target_size = (int(body['width']), int(body['height']), channels))
    prediction_image = image.img_to_array(prediction_image)
    prediction_image = np.expand_dims(prediction_image, axis = 0)

    # prediction_image = file.read()
    # prediction_image = np.fromstring(prediction_image, np.uint8)
    # prediction_image = np.array(prediction_image).astype('float32')/255
    # prediction_image = transform.resize(prediction_image, (int(body['width']), int(body['height']), channels))
    # prediction_image = np.expand_dims(prediction_image, axis=0)

    prediction = loaded_model.predict(prediction_image)
    print(prediction, sys.stdout)

    return body.getlist("labels[]")[max(range(len(prediction[0])), key=prediction[0].__getitem__)]