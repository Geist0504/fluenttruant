const { buildSchema } = require('graphql')

//TODO: Author should become a user at somepoint or use user ID more likely

module.exports = buildSchema(`
  type Lesson{
    _id: ID!
    title: String!
    author: User!
    description: String!
    language: String!
    difficulty: Int!
    createdOn: String!
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    password: String
    createdLessons: [Lesson!]
  }

  input UserInput{
    username: String!
    email: String!
    password: String
  }

  input LessonInput {
    title: String!
    author: String!
    description: String!
    language: String!
    difficulty: Int!
    createdOn: String!
  }

  type RootQuery {
    lessons: [Lesson!]!
  }

  type RootMutation {
    createLesson(lessonInput: LessonInput) : Lesson
    createUser(userInput: UserInput) : User
  }

  schema{
    query: RootQuery
    mutation: RootMutation
  }
`)