from tensorflow.keras.models import load_model
import numpy as np

def model():
    model = load_model("files/test", compile = True)

    return "%.5f" % model.predict(np.array([[0.105193944,0.426992288,0.895492958,0.24892057,0.139570248,0.336065574,0.386857143,0.226867628]]))