from flask import jsonify
import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential
from tensorflow.keras.callbacks import LearningRateScheduler, EarlyStopping
import json
import sys

def model(body):
    if int(body['label']) > 2:
        label_mode = 'categorical'
    else:
        label_mode = 'binary'

    training_set = tf.keras.utils.image_dataset_from_directory(
                'files/{}/images'.format(body['imageFile']),
                validation_split=float(body['validation_split']),
                subset="training",
                seed=123,
                label_mode=label_mode,
                image_size=(int(body['height']), int(body['width'])),
                batch_size=int(body['batch']))
        
    validation_set = tf.keras.utils.image_dataset_from_directory(
                    'files/{}/images'.format(body['imageFile']),
                    validation_split=float(body['validation_split']),
                    subset="validation",
                    seed=123,
                    label_mode=label_mode,
                    image_size=(int(body['height']), int(body['width'])),
                    batch_size=int(body['batch']))

    AUTOTUNE = tf.data.AUTOTUNE

    training_set = training_set.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    validation_set = validation_set.prefetch(buffer_size=AUTOTUNE)

    if body['rgb']:
        channels = 3
    else:
        channels = 1

    model = Sequential()

    for i in range(len(body.getlist("model[]"))):
        node = json.loads(body.getlist("model[]")[i])

        if i == 0:
            model.add(layers.Rescaling(1./255, 
                                        input_shape=(int(body['height']), 
                                        int(body['width']), 
                                        channels)))
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

    if body['optimiser'] == "Adadelta":
        optimiser = tf.keras.optimizers.Adadelta(learning_rate=float(body['initial_lr']))
    elif body['optimiser'] == "Adagrad":
        optimiser = tf.keras.optimizers.Adagrad(learning_rate=float(body['initial_lr']))
    elif body['optimiser'] == "Adam":
        optimiser = tf.keras.optimizers.Adam(learning_rate=float(body['initial_lr']))
    elif body['optimiser'] == "Adamax":
        optimiser = tf.keras.optimizers.Adamax(learning_rate=float(body['initial_lr']))
    elif body['optimiser'] == "Ftrl":  
        optimiser = tf.keras.optimizers.Ftrl(learning_rate=float(body['initial_lr']))
    elif body['optimiser'] == "Nadam":
        optimiser = tf.keras.optimizers.Nadam(learning_rate=float(body['initial_lr']))
    elif body['optimiser'] == "RMSprop":
        optimiser = tf.keras.optimizers.RMSprop(learning_rate=float(body['initial_lr']))
    else:
        optimiser = tf.keras.optimizers.SGD(learning_rate=float(body['initial_lr']))

    model.compile(loss=body['loss'], optimizer=optimiser, metrics=['accuracy'])

    callbacks = []

    if body['early_stopping'] == "true":
        callbacks.append(EarlyStopping(monitor='loss', patience=int(body['patience']), min_delta=float(body['improvement']), mode='auto'))

    if body['lr_scheduler'] == "true":
        callbacks.append(LearningRateScheduler(lambda epoch: 1e-4 * 10**(epoch/20)))

    history = model.fit(training_set, validation_data=validation_set, epochs=int(body['epochs']), callbacks=callbacks)

    test_loss, test_acc = model.evaluate(validation_set, verbose=0)

    model.save('models/{}'.format(body['id']))

    return {"training": history.history, "test_loss": test_loss, "test_acc": test_acc, "epochs": len(history.history['accuracy'])}