import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from sklearn.compose import make_column_transformer
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.metrics import accuracy_score, mean_squared_error

def model():
    data = pd.read_csv('files/training_data.csv')

    X = pd.get_dummies(data.drop(['Index Flood'], axis=1))
    y = data['Index Flood']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    if False:
        ct = make_column_transformer(
            (MinMaxScaler(), []),
            (OneHotEncodner(handler_unknown='ignore'), [])
        )

        ct.fit(X_train)
        X_train_normal = ct.transform(X_train)
        X_test_normal = ct.transform(X_test)

    y_train.head() 

    model = Sequential()
    model.add(Dense(units=32, activation='relu', input_dim=len(X_train.columns)))
    model.add(Dense(units=64, activation='relu'))
    model.add(Dense(units=64, activation='sigmoid'))
    model.add(Dense(units=1, activation=None))

    model.compile(loss='mse', optimizer='sgd', metrics=['mae', 'mse'])

    history = model.fit(X_train, y_train, epochs=10, validation_split=0.2, batch_size=1)

    y_hat = model.predict(X_test)
    # y_hat = [0 if val < 0.5 else 1 for val in y_hat]
    # "%.5f" % accuracy_score(y_test, y_hat)
    print(history.history)

    model.save('files/test')

    return "%.5f" % mean_squared_error(y_test, y_hat)


