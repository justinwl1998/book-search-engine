import { gql } from '@apollo/client';

export const GET_ME = gql`
    query me {
        User {
            _id
            username
            email
            password
            savedBooks {
                bookId
                title
                description
                authors
                image
                link
            }
        }
    }
`;