const mongoose = require('mongoose');
// const validator = require('validator');

const taskSchema = new mongoose.Schema({
    description: {
        required: true,
        type: String,
        trim: true,
    },
    completed: {
        required: false,
        type: Boolean,
        default: false,
        // validation(value){
        // }
    },
    owner: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

taskSchema.pre('save', function(next){
    const task = this;

    task.description = task.description + ' (pure)';

    next();
});

taskSchema.pre('findOneAndUpdate', async function(next){
    const task = this;

    if(task._update.description){
        task._update.description = task._update.description + ' (modified)';
    }

    next();
});


const Task = mongoose.model('Task', taskSchema);

module.exports = {
    Task
}