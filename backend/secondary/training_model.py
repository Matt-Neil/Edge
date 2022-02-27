import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import LearningRateScheduler, EarlyStopping
from sklearn.compose import make_column_transformer
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.metrics import accuracy_score
import sys

def model(body):
    if body['dataType'] == "value":
        data = pd.read_csv('files/{}.csv'.format(body['datafile']))

        X = pd.get_dummies(data.drop([body['target']], axis=1))
        y = data[body['target']].apply(lambda x: 1 if x == 'Yes' else 0)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=float(body['test_split']))

        # if bool(body['encoded']) and bool(body['normalised']):
        #     ct = make_column_transformer(
        #         (MinMaxScaler(), []),
        #         (OneHotEncoder(handler_unknown='ignore'), [])
        #     )
        # elif bool(body['encoded']) and not(bool(body['normalised'])):
        #     ct = make_column_transformer(
        #         (MinMaxScaler(), []),
        #         (OneHotEncoder(handler_unknown='ignore'), [])
        #     )
        # elif bool(body['normalised']) and not(bool(body['encoded'])):
        #     ct = make_column_transformer(
        #         (MinMaxScaler(), []),
        #         (OneHotEncoder(handler_unknown='ignore'), [])
        #     )
        # else:
        #     ct = make_column_transformer(
        #         (MinMaxScaler(), []),
        #         (OneHotEncoder(handler_unknown='ignore'), [])
        #     )

        # ct.fit(X_train)
        # X_train = ct.transform(X_train)
        # X_test = ct.transform(X_test)
    else:
        data = pd.read_csv('files/training_data.csv')

        X = pd.get_dummies(data.drop(['Index Flood'], axis=1))
        y = data['Index Flood']

        #y_train and y_test are labels

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    X_train.head()
    y_train.head() 

    model = Sequential()
    
    for i in range(1, len(body.getlist("activations[]"))):
        if i == 1:
            model.add(Dense(units=int(body.getlist("units[]")[i]), activation=body.getlist("activations[]")[i], input_dim=len(X_train.columns)))
        else:
            model.add(Dense(units=int(body.getlist("units[]")[i]), activation=body.getlist("activations[]")[i]))

    model.compile(loss=body['loss'], optimizer=body['optimiser'], metrics='accuracy')

    callbacks = [EarlyStopping(monitor='loss', patience=int(body['patience']), min_delta=float(body['improvement']), mode='auto')]

    if bool(body['lr_scheduler']):
        callbacks.append(LearningRateScheduler(lambda epoch: 1e-4 * 10**(epoch/20))) 

    history = model.fit(X_train, y_train, epochs=int(body['epochs']), validation_split=(float(body['validation_split'])/(1-float(body['test_split']))), callbacks=callbacks, batch_size=int(body['batch']))

    y_hat = model.predict(X_test)
    y_hat = [0 if val < 0.5 else 1 for val in y_hat]
    print(history.history)

    model.save('models/{}'.format(body['id']))

    return "%.5f" % accuracy_score(y_test, y_hat)