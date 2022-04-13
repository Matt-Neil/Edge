const mongoose = require('mongoose');

const NodesSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    units: {
        type: Number, 
        required: false
    }, 
    kernel: {
        type: Number,
        required: false
    }, 
    strides: {
        type: Number,
        required: false
    }, 
    padding: {
        type: String,
        required: false
    }, 
    momentum: {
        type: Number,
        required: false
    }, 
    pool: {
        type: Number,
        required: false
    }, 
    rate: {
        type: Number,
        required: false
    },
    filters: {
        type: Number,
        required: false
    },
    activation: {
        type: String,
        required: false
    }
}, { _id : false })

const ConfigurationSchema = new mongoose.Schema({
    epochs: {
        type: Number,
        required: true
    },
    training_split: {
        type: Number, 
        required: true
    }, 
    validation_split: {
        type: Number,
        required: true
    }, 
    improvement: {
        type: Number,
        required: true
    }, 
    early_stopping: {
        type: Boolean,
        required: true
    }, 
    patience: {
        type: Number,
        required: true
    }, 
    batch: {
        type: Number,
        required: true
    }, 
    lr_scheduler: {
        type: Boolean,
        required: true
    }, 
    initial_lr: {
        type: Number,
        required: true
    }, 
    optimiser: {
        type: String,
        required: true
    }, 
    loss: {
        type: String,
        required: true
    }, 
    decay_rate: {
        type: Number,
        required: false
    }, 
    decay_steps: {
        type: Number,
        required: false
    }
}, { _id : false })

const EvaluationSchema = new mongoose.Schema({
    testAcc: {
        type: Number,
        required: true
    },
    testLoss: {
        type: Number,
        required: true
    },
    trainAcc: {
        type: [Number],
        required: true
    },
    trainLoss: {
        type: [Number],
        required: true
    },
    validationAcc: {
        type: [Number],
        required: true
    },
    validationLoss: {
        type: [Number],
        required: true
    },
    trainEpochs: {
        type: Number,
        required: true
    },
    trainTime: {
        type: Number,
        required: true
    }
}, { _id : false })

const ItemsSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: { 
        type: String, 
        required: true,
        index: true,
        text: true
    },
    description: { 
        type: String, 
        required: true,
        index: true,
        text: true
    },
    picture: {
        type: String,
        required: true
    },
    upvotes: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    bookmarks: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    visibility: {
        type: Boolean,
        required: true
    },
    model: {
        type: [NodesSchema],
        required: false,
        default: undefined
    },
    configuration: {
        type: ConfigurationSchema,
        required: false
    },
    dataset: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    imageDir: {
        type: String,
        required: false
    },
    updated: {
        type: Date,
        required: true
    },
    rgb: {
        type: Boolean,
        required: false
    },
    width: {
        type: Number,
        required: false
    },
    height: {
        type: Number,
        required: false
    },
    labels: {
        type: [String],
        required: false,
        default: undefined
    },
    evaluation: {
        type: EvaluationSchema,
        required: false
    },
    type: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Item', ItemsSchema);