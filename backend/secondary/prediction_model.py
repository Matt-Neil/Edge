import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from sklearn.metrics import accuracy_score, mean_squared_error

def model():
    df = pd.read_csv('files/training_data.csv')

    X = pd.get_dummies(df.drop(['Index Flood'], axis=1))
    y = df['Index Flood']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2)
    y_train.head()

    model = Sequential()
    model.add(Dense(units=32, activation='relu', input_dim=len(X_train.columns)))
    model.add(Dense(units=64, activation='relu'))
    model.add(Dense(units=1, activation='sigmoid'))

    model.compile(loss='mse', optimizer='sgd', metrics=['mae', 'mse'])

    history = model.fit(X_train, y_train, epochs=10, validation_split=0.2, batch_size=1)

    y_hat = model.predict(X_test)
    # y_hat = [0 if val < 0.5 else 1 for val in y_hat]
    # "%.5f" % accuracy_score(y_test, y_hat)
    print(history.history)

    model.save('files/test')

    return "%.5f" % mean_squared_error(y_test, y_hat)


