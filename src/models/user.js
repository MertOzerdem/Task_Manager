const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Task } = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email is invalid')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age cannot be negative number')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(validator.contains(value, 'password')){
                throw new Error('password has password keyword')
            }
        }
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
});

// virtual data (relationship)
userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


// static methods are accessiable on models (aka. "model methods")
// used stataic method to query inside whole User collection
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email});

    // console.log("user", user);

    if(!user){
        throw new Error('Unable to login');
    }

    console.log("password", await bcrypt.hash(password, 8));
    console.log("user.password", user.password);
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("isMatch", isMatch);

    if(!isMatch){
        throw new Error('Unable to login');
    }

    return user;
}

// methods are accessable on instances (aka. "instace methods")
// used methods to apply of an instance of an User object
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();
    
    return token;
}

// override toJSON function for User
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    //console.log("userObject", userObject)
    return userObject;
}

// change individual
userSchema.methods.getPublicProfile = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    //console.log("userObject", userObject)
    return userObject;
}

userSchema.pre('save', async function(next){
    const user = this;
    // console.log(user.tokens);
    
    // if(!user.tokens.length){
    if(user.tokens[0] && user.tokens[0].token== 'creation'){
        user.tokens = [];
        console.log('No token hash password');
        user.password = await bcrypt.hash(user.password, 8);
    }

    console.log('just before saving');
 
    next();
});

userSchema.pre('findOneAndUpdate', async function(next){
    const user = this;
    console.log(user);
    
    if(user._update.password && user._update.password.length > 6){ 
        user._update.password = await bcrypt.hash(user._update.password, 8);
    }
    console.log('just before updating');

    next();
});

userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = {
    User
}

// const bcrypt = require('bcryptjs')

// const myfunc = async ()=>{
//     const pass = 'Mert2314';
//     const hashed = await bcrypt.hash(pass, 8);

//     console.log(pass);
//     console.log(hashed);

//     const isMatch = await bcrypt.compare('Mert2314',hashed);
//     console.log(isMatch);
// }

// myfunc();


