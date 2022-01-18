import numpy as np
import csv

def model():
    #Opens file containing the training data set and stores each row in a list
    with open("files/training_data.csv") as training_data_set:
        training_data = []
        for training_row in training_data_set:
            training_data.append(training_row)

    #Opens file containing the validation data set and stores each row in a list
    with open("files/validation_data.csv") as validation_data_set:
        validation_data = []
        for validation_row in validation_data_set:
            validation_data.append(validation_row)

    #Receives user input for the number of inputs
    number_inputs = 9
    #Receives user input for the number of hidden training_layers
    number_hidden_layers = 4
    #Receives user input for the number of hidden nodes in each hidden layer
    number_hidden_nodes = [None] * number_hidden_layers
    for i in range(len(number_hidden_nodes)):
        number_hidden_nodes[i] = 2
    #Receives user input for the learning rate
    learning_rate = 0.1

    #Creates a list containing a column vector for each layer and its nodes along with a final layer storing the target output
    training_layers = [None for i in range(number_hidden_layers + 3)]
    validation_layers = [None for i in range(number_hidden_layers + 3)]
    test_layers = [None for i in range(number_hidden_layers + 3)]
    #Loops through each layer
    for i in range(len(training_layers)):
        #Checks if the layer is the training input layer or training target layer
        if i == 0 or i == len(training_layers)-1:
            continue
        #Checks if the layer is the training output layer
        elif i == len(training_layers)-2: 
            training_layers[i] = np.empty(shape=[1, 1])
            validation_layers[i] = np.empty(shape=[1, 1])
            test_layers[i] = np.empty(shape=[1, 1])
        #Else the layer is a training hidden layer
        else:
            validation_layers[i] = np.empty(shape=[number_hidden_nodes[i-1], 1])
            training_layers[i] = np.empty(shape=[number_hidden_nodes[i-1], 1])
            test_layers[i] = np.empty(shape=[number_hidden_nodes[i-1], 1])

    #Creates a list containing a matrix for each weight layer
    weights = [None for i in range(number_hidden_layers + 1)]
    #Loops through each weight layer
    for x in range(len(weights)):
        training_row = []
        #Checks if the layer is between the input layer and a hidden layer
        if x == 0:
            #Sets the range using the number of inputs from the input layer
            value_range = 2/float(number_inputs)
            #Creates a matrix where each element is a random number in the range
            weights[x] = np.random.uniform(-1*value_range, value_range, [number_hidden_nodes[x], number_inputs])
        #Checks if the layer is between a hidden layer and the output layer
        elif x == len(weights)-1:
            #Sets the range using the number of inputs from the previous hidden layer
            value_range = 2/float(number_hidden_nodes[x-1])
            weights[x] = np.random.uniform(-1*value_range, value_range, [1, number_hidden_nodes[x-1]])
        #Else the layer is between two hidden training_layers
        else:
            value_range = 2/float(number_hidden_nodes[x-1])
            weights[x] = np.random.uniform(-1*value_range, value_range, [number_hidden_nodes[x], number_hidden_nodes[x-1]])

    #Creates a list containing a column vector for each bias layer
    biases = [None for i in range(number_hidden_layers + 1)]
    #Loops through each bias layer
    for x in range(len(biases)):
        #Checks if the layer is the first hidden layer
        if x == 0:
            #Sets the range using the number of inputs from the input layer
            value_range = 2/float(number_inputs)
        #Else checks if the layer is any subsequent hidden training_layers or the output layer
        else:
            #Sets the range using the number of inputs from the previous hidden layer
            value_range = 2/float(number_hidden_nodes[x-1])
        #Creates a column vector where each element is a random number in the range
        biases[x] = np.random.uniform(-1*value_range, value_range, [training_layers[x+1].shape[0], 1])

    #Creates a list containing a column vector for each training delta layer
    training_deltas = [None for i in range(number_hidden_layers + 1)]
    #Loops through each delta layer
    for i in range(len(training_deltas)):
        #Checks if the layer is the output layer
        if i == len(training_deltas)-1:
            training_deltas[i] = np.empty(shape=[1, 1])
        #Else is a hidden layer
        else:
            training_deltas[i] = np.empty(shape=[number_hidden_nodes[i], 1])
            
    #Initialises a counter for epochs
    epoch = 500
    #Initialises a variable to store the MSE of the validation set after each epoch - initial value is 1 as it can never be larger than 1
    validation_previous_error = 1
    #Stores the best weight matrices
    best_weights = weights
    #Stores the best bias vectors
    best_biases = biases
    best_error = 1

    #Loops while the MSE of the validation set is smaller than the MSE of the validation set in the previous epoch
    while epoch <= 1000:
        #Creates a list storing squared error values for each row in the corresponding data set
        validation_squared_error = []
        training_squared_error = []

        #Loops through each training_row in the training data set
        for x in training_data:
            #Splits each value in the training_row by a comma and stores as a float in a list
            training_row = [float(element) for element in x.split(",")]
            #Creates an empty column vector for the input layer
            training_layers[0] = np.empty(shape=[0, 1])
            #Creates an empty column vector for the target layer
            training_layers[len(training_layers)-1] = np.empty(shape=[0, 1])
            
            #Loops through the number of inputs and appends each value to the column vector in the input layer
            for i in range(number_inputs):
                training_layers[0] = np.append(training_layers[0], [[training_row[i]]], axis=0)
            
            #Loops through the number of outputs and appends each value to the column vector in the target layer
            for i in range(1):
                training_layers[len(training_layers)-1] = np.append(training_layers[len(training_layers)-1], 
                    [[training_row[len(training_row)-(i+1)]]], axis=0)

            #Forward pass loop beginning at the first hidden layer for the training data set
            for i in range(1, len(training_layers)-1):
                #Stores the activations column vector in the corresponding layer
                #Calculates the sigmoid function of the weighted sums
                training_layers[i] = 1/(1 + np.exp(-1 * np.add(biases[i-1], np.dot(weights[i-1], training_layers[i-1])
                    .reshape(len(training_layers[i]), 1))))
            
            #Calculates the squared error for each row in the training data set
            training_squared_error.append(np.sum(np.square(np.subtract(training_layers[len(training_layers)-1], 
                training_layers[len(training_layers)-2])))/float(len(training_layers[len(training_layers)-1])))

            """Backward pass loop"""
            for i in reversed(range(len(training_layers)-2)):
                #Checks if calculating delta for output layer
                if len(training_layers)-3 == i:
                    #Stores the delta column vector for the output layer
                    training_deltas[i] = np.multiply(np.subtract(training_layers[len(training_layers)-1], training_layers[i+1]), 
                        np.multiply(training_layers[i+1], np.subtract(1, training_layers[i+1])))
                else:
                    #Stores the delta column vector in the corresponding delta layer
                    training_deltas[i] = np.multiply(np.dot(weights[i+1].T, training_deltas[i+1]), np.multiply(training_layers[i+1], 
                        np.subtract(1, training_layers[i+1])))

            """Updates each weight and bias value"""
            for i in range(len(training_layers)-2):
                #Updates the weight matrix
                weights[i] = np.add(weights[i], (np.dot(training_deltas[i], training_layers[i].T) * learning_rate))
                #Updates the bias column vector
                biases[i] = np.add(biases[i], learning_rate * training_deltas[i])

        #Loops through each training_row in the validation data set
        for y in validation_data:
            validation_row = [float(element) for element in y.split(",")]
            validation_layers[0] = np.empty(shape=[0, 1])
            validation_layers[len(validation_layers)-1] = np.empty(shape=[0, 1])

            for i in range(number_inputs):
                validation_layers[0] = np.append(validation_layers[0], [[validation_row[i]]], axis=0)
            
            for i in range(1):
                validation_layers[len(validation_layers)-1] = np.append(validation_layers[len(validation_layers)-1], 
                    [[validation_row[len(validation_row)-(i+1)]]], axis=0)

            for i in range(1, len(validation_layers)-1):
                validation_layers[i] = 1/(1 + np.exp(-1 * np.add(biases[i-1], np.dot(weights[i-1], validation_layers[i-1])
                    .reshape(len(validation_layers[i]), 1))))

            #Calculates the squared error for each row in the validation data set
            validation_squared_error.append(np.sum(np.square(np.subtract(validation_layers[len(validation_layers)-1], 
                validation_layers[len(validation_layers)-2])))/float(len(validation_layers[len(validation_layers)-1])))

        #Checks if the current MSE of the validation set is lower than 1.2x of the previous the MSE of the validation set
        if sum(validation_squared_error)/float(len(validation_squared_error)) < (validation_previous_error*1.2): 
            #Storing the current MSE as the previous MSE
            validation_previous_error = sum(validation_squared_error)/float(len(validation_squared_error))
            #Checks if the MSE of the current configuration is smaller than the MSE of the current best configuration
            if sum(validation_squared_error)/float(len(validation_squared_error)) < best_error:
                best_weights = weights
                best_biases = biases
                best_error = sum(validation_squared_error)/float(len(validation_squared_error))
            epoch += 1
        else:
            break

    print(best_weights)

    filename = "file.csv"
    file = open('files/' + filename, 'w')
    writer = csv.writer(file)
    writer.writerow("asdasd")
    file.close()

    return "OK"