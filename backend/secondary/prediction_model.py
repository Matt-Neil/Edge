import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import LearningRateScheduler
from sklearn.compose import make_column_transformer
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.metrics import accuracy_score
import sys

def model():
    data = pd.read_csv('files/2022-01-30T11:47:49.317Z.csv')

    X = pd.get_dummies(data.drop(['Churn'], axis=1))
    y = data['Churn'].apply(lambda x: 1 if x == 'Yes' else 0)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    X_train.head()
    y_train.head() 

    model = Sequential()
    model.add(Dense(units=32, activation='relu', input_dim=len(X_train.columns)))
    model.add(Dense(units=64, activation='relu'))
    model.add(Dense(units=1, activation='sigmoid'))

    model.compile(loss='binary_crossentropy', optimizer='sgd', metrics='accuracy')

    history = model.fit(X_train, y_train, epochs=100, batch_size=32)

    y_hat = model.predict(X_test)
    y_hat = [0 if val < 0.5 else 1 for val in y_hat]
    # y_hat = [0 if val < 0.5 else 1 for val in y_hat]
    # "%.5f" % accuracy_score(y_test, y_hat)
    print(history.history)

    #model.save('files/test')

    return "%.5f" % accuracy_score(y_test, y_hat)