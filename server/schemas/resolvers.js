const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            console.log('QUERY_ME called')
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select(
                    "-__v -password"
                );
                console.log(userData)
                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },
        users: async () => {
            return User.find({});
        }
    },
    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError("Incorrect email");
            }
            const passCheck = await user.isCorrectPassword(password);

            if (!passCheck) {
                throw new AuthenticationError("Incorrect password");
            }

            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                const userData = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $addToSet: { savedBooks: input }},
                    { new: true, runValidators: true }
                );

                return userData;
            }

            throw new AuthenticationError('You need to be logged in to save books.');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const userData = await User.findByIdAndUpdate(
                    {_id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId }}},
                    { new: true }
                );

                return userData;
            }

            throw new AuthenticationError('You need to be logged in to remove books.');
        }
    }
};

module.exports = resolvers;