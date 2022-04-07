import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.optimizers.schedules import ExponentialDecay
from tensorflow.keras.optimizers import Adadelta, Adagrad, Adam, Adamax, Ftrl, Nadam, RMSprop, SGD
import json
from zipfile import ZipFile, ZIP_DEFLATED
import os

def train(body):
    if int(body['label']) > 2:
        label_mode = 'categorical'
    else:
        label_mode = 'binary'

    if body['rgb']:
        color_mode = "rgb"
    else:
        color_mode = "grayscale"

    training_set = tf.keras.utils.image_dataset_from_directory(
                'files/{}/images'.format(body['imageFile']),
                validation_split=float(body['validation_split']),
                labels='inferred',
                subset="training",
                seed=123,
                color_mode=color_mode,
                label_mode=label_mode,
                image_size=(int(body['height']), int(body['width'])),
                batch_size=int(body['batch']))
        
    validation_set = tf.keras.utils.image_dataset_from_directory(
                    'files/{}/images'.format(body['imageFile']),
                    validation_split=float(body['validation_split']),
                    labels='inferred',
                    subset="validation",
                    seed=123,
                    color_mode=color_mode,
                    label_mode=label_mode,
                    image_size=(int(body['height']), int(body['width'])),
                    batch_size=int(body['batch']))

    AUTOTUNE = tf.data.AUTOTUNE

    training_set = training_set.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    validation_set = validation_set.prefetch(buffer_size=AUTOTUNE)

    model = Sequential()

    for i in range(len(body.getlist("model[]"))):
        node = json.loads(body.getlist("model[]")[i])

        if i == 0:
            model.add(layers.Rescaling(1./255))
        elif i == len(body.getlist("model[]"))-1:
            model.add(layers.Dense(units=int(body['label']), 
                                    activation=node['activation']))
        else:
            if node['type'] == "Conv2D":
                model.add(layers.Conv2D(int(node['filters']),
                                        kernel_size=(int(node['kernel']), int(node['kernel'])), 
                                        strides=(int(node['strides']), int(node['strides'])), 
                                        padding=node['padding'],
                                        activation=node['activation']))
            elif node['type'] == "MaxPooling2D":
                model.add(layers.MaxPooling2D(pool_size=(int(node['pool']), int(node['pool'])), 
                                                strides=(int(node['strides']), int(node['strides'])), 
                                                padding=node['padding']))
            elif node['type'] == "AveragePooling2D":
                model.add(layers.AveragePooling2D(pool_size=(int(node['pool']), int(node['pool'])), 
                                                    strides=(int(node['strides']), int(node['strides'])), 
                                                    padding=node['padding']))
            elif node['type'] == "Dropout":
                model.add(layers.Dropout(rate=float(node['rate'])))
            elif node['type'] == "BatchNormalisation":
                model.add(layers.BatchNormalization(momentum=float(node['momentum'])))
            elif node['type'] == "Dense":
                model.add(layers.Dense(units=int(node['units']), 
                                        activation=node['activation']))
            else:
                model.add(layers.Flatten())
    
    if body['lr_scheduler'] == "true":
        lr_scheduler = ExponentialDecay(initial_learning_rate=float(body['initial_lr']), 
                                        decay_steps=int(body['decay_steps']), 
                                        decay_rate=float(body['decay_rate']))
    else:
        lr_scheduler = float(body['initial_lr'])

    if body['optimiser'] == "Adadelta":
        optimiser = Adadelta(learning_rate=lr_scheduler)
    elif body['optimiser'] == "Adagrad":
        optimiser = Adagrad(learning_rate=lr_scheduler)
    elif body['optimiser'] == "Adam":
        optimiser = Adam(learning_rate=lr_scheduler)
    elif body['optimiser'] == "Adamax":
        optimiser = Adamax(learning_rate=lr_scheduler)
    elif body['optimiser'] == "Ftrl":  
        optimiser = Ftrl(learning_rate=lr_scheduler)
    elif body['optimiser'] == "Nadam":
        optimiser = Nadam(learning_rate=lr_scheduler)
    elif body['optimiser'] == "RMSprop":
        optimiser = RMSprop(learning_rate=lr_scheduler)
    else:
        optimiser = SGD(learning_rate=lr_scheduler)

    model.compile(loss=body['loss'], optimizer=optimiser, metrics=['accuracy'])

    callbacks = []

    if body['early_stopping'] == "true":
        callbacks.append(EarlyStopping(monitor='loss', patience=int(body['patience']), min_delta=float(body['improvement']), mode='auto'))

    history = model.fit(training_set, validation_data=validation_set, epochs=int(body['epochs']), callbacks=callbacks, verbose=0)

    test_loss, test_acc = model.evaluate(validation_set, verbose=0)

    model.save('models/{}/model/'.format(body['id']))

    with ZipFile("models/{}/{}-model.zip".format(body['id'], body['id']), 'w', ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk('models/{}/model/'.format(body['id'])):
            for file in files:
                zip_file.write(os.path.join(root, file))

    return {"training": history.history, "test_loss": test_loss, "test_acc": test_acc, "epochs": len(history.history['accuracy'])}