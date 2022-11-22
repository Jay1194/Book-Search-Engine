
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {

    Query: {
      me: async (args, parent, context) => {

        if (context.user) {
          const userData = await User.findOne
          ({ _id: context.user._id })
          .select('-__v -password')
          .populate('books')

          return userData;
        }

        throw new AuthenticationError('You must log in!');
      },
    },

    Mutation: {
        addUser: async (parent, { email, username, password }) => {
          const user = await User.create({ username, email, password });
          const token = signToken(user);
          return { token, user };
        },

        login: async (parent, { email, password }) => {

            const user = await User.findOne({ email });

            if (!user) {
              throw new AuthenticationError('The email addresss entered is incorrect');
            }

            const correctPass = await user.isCorrectPassword (password);

            if(!correctPass) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { book }, context) => {

            if (context.user) {          
              const userUpdate= await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: book } },
                { new: true }
              );

              return userUpdate;
            }

            throw new AuthenticationError('please log in');
        },

        removeBook: async (parent, { bookId }, context) => {

            if (context.user) {
              const userUpdate = await User.findByIdAndUpdate(
                {_id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true },
              );
      
              return userUpdate;
            }

            throw new AuthenticationError('please log in');
          }
        },
      };
      
      module.exports = resolvers;

