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
    # Determines whether the model is multi-class or binary classification
    if int(body['label']) > 2:
        label_mode = 'categorical'
    else:
        label_mode = 'binary'

    # Sets the image colour mode to either rgb or greyscale
    if body['rgb']:
        color_mode = "rgb"
    else:
        color_mode = "grayscale"
        
    # Creates a TensorFlow dataset for training from the specified images sub-directory
    training_set = tf.keras.utils.image_dataset_from_directory(
                'datasets/{}/images'.format(body['imageDir']),
                validation_split=float(body['validation_split']),
                labels='inferred',
                subset="training",
                seed=123,
                color_mode=color_mode,
                label_mode=label_mode,
                image_size=(int(body['height']), int(body['width'])),
                batch_size=int(body['batch']))
                
    # Creates a TensorFlow dataset for validation from the specified images sub-directory
    validation_set = tf.keras.utils.image_dataset_from_directory(
                    'datasets/{}/images'.format(body['imageDir']),
                    validation_split=float(body['validation_split']),
                    labels='inferred',
                    subset="validation",
                    seed=123,
                    color_mode=color_mode,
                    label_mode=label_mode,
                    image_size=(int(body['height']), int(body['width'])),
                    batch_size=int(body['batch']))

    
    AUTOTUNE = tf.data.AUTOTUNE

    # Improves the performance of training the model
    training_set = training_set.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    validation_set = validation_set.prefetch(buffer_size=AUTOTUNE)

    # Creates a sequential model
    model = Sequential()

    # Loops through all layers specified by the user
    for i in range(len(body.getlist("model[]"))):
        node = json.loads(body.getlist("model[]")[i])
        
        # Input layer sets an image normalisation layer
        if i == 0:
            model.add(layers.Rescaling(1./255))
        # Output layer with the units set to the number of labels
        elif i == len(body.getlist("model[]"))-1:
            model.add(layers.Dense(units=int(body['label']), 
                                    activation=node['activation']))
        # Adds the other layer types to the sequential model with their properties
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
    
    # Checks if the user selected to use a learning rate scheduler
    if body['lr_scheduler'] == "true":
        # Sets the properties of the learning rate scheduler
        lr_scheduler = ExponentialDecay(initial_learning_rate=float(body['initial_lr']), 
                                        decay_steps=int(body['decay_steps']), 
                                        decay_rate=float(body['decay_rate']))
    else:
        # Sets the learning rate scheduler to a constant initial learning rate
        lr_scheduler = float(body['initial_lr'])

    # Sets the optimiser with the learning rate scheduler
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

    # Compiles the model using the loss and optimiser specified and evaluation metrics
    model.compile(loss=body['loss'], optimizer=optimiser, metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()])

    callbacks = []

    # Checks if the user selected early stopping
    if body['early_stopping'] == "true":
        # Sets the properties of early stopping callback
        callbacks.append(EarlyStopping(monitor='loss', patience=int(body['patience']), min_delta=float(body['improvement']), mode='auto'))

    # Trains the models with the training and validation set created for the number of epochs specified by the user
    history = model.fit(training_set, validation_data=validation_set, epochs=int(body['epochs']), callbacks=callbacks, verbose=0)

    # Evaluates the model for the test loss, accuracy, precision and recall
    test = model.evaluate(validation_set, verbose=0)

    # Saves the model to be used later for prediction
    model.save('models/{}/model/'.format(body['id']))

    # Creates a zip file of the saved model
    with ZipFile("models/{}/{}-model.zip".format(body['id'], body['id']), 'w', ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk('models/{}/model/'.format(body['id'])):
            for file in files:
                zip_file.write(os.path.join(root, file))

    # Return all evaluation results to the front-end
    return {"training": history.history, "test": test, "epochs": len(history.history['accuracy'])}