import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';

export const AccountSchema = new mongoose.Schema( {
  name: { type: String, default: 'John' },
  surname: { type: String, default: 'Doe' },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    index: true,
    validate: {
      validator( v ) {
        let regEx = /\S+@\S+\.\S+/
        return regEx.test( v )
      },
      message: props => `${props.value} much email wow error`
    }
  },
  password: String,
  company: String,
  apitoken: String,
  logins: { type: Array, default: [ ] },
  avatar: String,
  role: { type: String, default: 'user' },
  private: { type: Boolean, default: true },
  verified: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  providerProfiles: { type: Object, default: {} },
}, { timestamps: true } )


AccountSchema.methods.validatePassword = ( pw, upw, cb ) => {
  bcrypt.compare( pw, upw, ( err, res ) => {
    if ( res === true ) return cb( true )
    else return cb( false )
  } )
}

// module.exports = mongoose.model( 'User', userSchema )

// export AccountSchema
