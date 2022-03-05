import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import LearningRateScheduler, EarlyStopping
from sklearn.metrics import accuracy_score
import sys

def model(body):
    if body['dataType'] == "value":
        dataFrame = pd.read_csv('files/{}.csv'.format(body['datafile']))

        X = pd.get_dummies(dataFrame.drop([body['target']], axis=1))

        target = []

        for index, row in dataFrame.iterrows():
            target.append(body.getlist('labels[]').index(row[body['target']]))

        y = pd.DataFrame(
            {
                body['target']: target
            }
        )

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=float(body['test_split'])) 
    else:
        X = ""
        y = body.getlist('labels[]')

        #y_train and y_test are labels

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    X_train.head()
    y_train.head() 

    model = Sequential()
    
    for i in range(1, len(body.getlist("activations[]"))):
        if i == 1:
            if body['dataType'] == "value":
                model.add(Dense(units=int(body.getlist("units[]")[i]), activation=body.getlist("activations[]")[i], input_dim=len(X_train.columns)))
            else:
                model.add(Flatten(input_shape(28, 28))) 
                model.add(Dense(units=int(body.getlist("units[]")[i]), activation=body.getlist("activations[]")[i]))
        else:
            model.add(Dense(units=int(body.getlist("units[]")[i]), activation=body.getlist("activations[]")[i]))

    model.compile(loss=body['loss'], optimizer=body['optimiser'], metrics='accuracy')

    callbacks = [EarlyStopping(monitor='loss', patience=int(body['patience']), min_delta=float(body['improvement']), mode='auto')]

    if bool(body['lr_scheduler']):
        callbacks.append(LearningRateScheduler(lambda epoch: 1e-4 * 10**(epoch/20))) 

    history = model.fit(X_train, y_train, epochs=int(body['epochs']), validation_split=(float(body['validation_split'])/(1-float(body['test_split']))), callbacks=callbacks, batch_size=int(body['batch']))

    y_hat = model.predict(X_test)
    if len(int(body.getlist('labels[]'))) == 2:
        y_hat = [0 if val < 0.5 else 1 for val in y_hat]
    print(history.history)

    model.save('models/{}'.format(body['id']))

    return "%.5f" % accuracy_score(y_test, y_hat)