import React, { Component } from 'react'

import AllText from "../components/Questions/allText";
import Modal from '../components/Questions/Modal'
import ProgressBar from '../components/Individual_Lessons/Progress'
import { Carousel } from 'react-bootstrap';
import '../components/Carousel/carousel.css';
import './SingleLesson.css'
import { Button } from '@material-ui/core';
import  AuthContext  from '../context/auth-context'

const { backendCall } = require('../helpers/backendCall')
const {objArrayToString } = require('../helpers/objArrayToString')
const shuffle = require('knuth-shuffle').knuthShuffle;

const correctAnswerResponses =["Stay gold pony boy!", "You Rock!", "More majestic than 16 Tigers!"]
const incorrectAnswerResponses = ["Nope", "Maybe try again", "Well at least you know which one it's not"]

export default class SingleLesson extends Component {

  static contextType = AuthContext

    constructor(props) {
      super(props)
      
      this.state = {
        lesson:null,
        isLoading: true,
        error: null,
        modal: false,
        index: 0,
        direction: null,
        accessibleQuestions: [],
        score: 0,
        complete: false,
        modalText: 'placeholder',
        questionData:[], 
        userId:  "5c2fe0236f2bc3014e8405f0",
        modalHeader: "",
        recentAnswerCorrect:null,
      }
      this.handleAnswer = this.handleAnswer.bind(this);
      this.closeModal = this.closeModal.bind(this);
      this.handleSelect = this.handleSelect.bind(this);
      this.handleCorrectAnswer = this.handleCorrectAnswer.bind(this);
      this.handleIncorrectAnswer = this.handleIncorrectAnswer.bind(this);
      this.lessonComplete = this.lessonComplete.bind(this);
      this.calculateScore = this.calculateScore.bind(this);
    }
    
    async componentDidMount(){
        this.setState({isLoading: true})
        console.log(this.context);
        
        let requestBody = {
          query: `
            query{
              lesson(id: "${this.props.match.params.id}"){
                _id
                title
                difficulty
                questions{
                    _id
                    prompt
                    answer
                    incorrectAnswers
                }
              }
            }
          `
        }
        try{
            let resData = await backendCall(requestBody);
            let lesson = resData.data.lesson
            lesson.questions.forEach((question, index) => {
              lesson.questions[index].possibleAnswers = shuffle(lesson.questions[index].incorrectAnswers.concat(lesson.questions[index].answer))
            });
            this.setState({lesson: lesson, 
                          userId: this.context.userId,
                          isLoading:false,
                          accessibleQuestions: [lesson.questions[0]]});
            window.responsiveVoice.speak(this.state.accessibleQuestions[0].prompt, "Brazilian Portuguese Female")

            
          }catch(err) {
            console.log(err)
            this.setState({ error: err, isLoading:false})
          }
    }

    closeModal(){
      this.setState({ modal: false})
      if(this.state.lesson.questions.length !== this.state.index+1 && this.state.recentAnswerCorrect){ //This is a test to see if there will be an index to move into
        this.setState({index: this.state.index + 1})
        window.responsiveVoice.speak(this.state.accessibleQuestions[this.state.index+1].prompt, "Brazilian Portuguese Female")
      }
    }

    async lessonComplete() {
      this.setState({
        modal:true,
        modalHeader: "Correct",
        modalText: 'all done pony boy',
        complete: true
      })
      let questionDataString = objArrayToString(this.state.questionData)

      let requestBody = {
        query: `
          mutation{
            completeLesson(lessonId: "${this.state.lesson._id}", userId:"${this.state.userId}", score:${this.state.score}, questionData:${questionDataString}){ 
              _id
              score
              lesson{
                title
              }
              user{
                  username
              }
            }
          }
        `
      }
      try{
        let resData = await backendCall(requestBody);
        let response = resData.data
        console.log(response);
        //TODO: Something after addition
        //this.props.history.push("/lessons");
      }catch(err) {
        console.log(err)
        this.setState({ error: err, isLoading:false})
      }
    }

    calculateScore(){
      const { questionData, lesson, index } = this.state
      const points = 1 / this.state.lesson.questions.length * 100
      questionData[index] = {
        questionId: lesson.questions[index]._id,
        score: points
      }
      this.setState({
        score: this.state.score + points,
        questionData: questionData
      }, () => {
        return points;
      })
    }

    async handleCorrectAnswer() {
      const { lesson, accessibleQuestions, index } = this.state
    if(this.state.lesson.questions.length === this.state.index+1){ //This means all questions are complete
      await this.calculateScore();
      this.lessonComplete();
    }else{
      await this.calculateScore()
        this.setState({
          accessibleQuestions: accessibleQuestions.concat(lesson.questions[index+1]),
          modal:true,
          recentAnswerCorrect:true,
          modalHeader: "Correct",
          modalText: correctAnswerResponses[Math.floor(Math.random()*correctAnswerResponses.length)]
        })
      } 
      return true
    }
    handleIncorrectAnswer(){
      this.setState({
        modal:true,
        modalHeader: "Not Quite Right",
        recentAnswerCorrect:false,
        modalText: incorrectAnswerResponses[Math.floor(Math.random()*incorrectAnswerResponses.length)]
      })
    }

    handleSelect(selectedIndex, e) {
      let index = selectedIndex
      this.setState({
        index: index,
        direction: e.direction,
      });
      window.responsiveVoice.speak(this.state.accessibleQuestions[selectedIndex].prompt, "Brazilian Portuguese Female")
    }
    handleAnswer(answerCorrect){
      answerCorrect ? this.handleCorrectAnswer() : this.handleIncorrectAnswer()
    }
  render() {
    //const lessonId = this.props.match.params.id;
    const {  lesson, isLoading, error, index, direction, accessibleQuestions, score } = this.state;
    let nextIcon = <span className="glyphicon glyphicon-chevron-right"></span>

    if(error){
        return <p>{error.message}</p>;
      }
      
      if (isLoading) {
        return <p>Loading ...</p>;
      }

      if(index === accessibleQuestions.length - 1){
        nextIcon = null
    }
    
    return (
      <div className='lesson-page'>
        <h1 className='title'>{lesson.title}</h1>
        <ProgressBar score={score} />
        <Carousel 
          activeIndex={index}
          direction={direction}
          onSelect={this.handleSelect}
          nextIcon={nextIcon}
          wrap={false}>
            {accessibleQuestions.map(question => (
              <Carousel.Item key={question.prompt}>
                <AllText key={question.prompt} possibleAnswers={question.possibleAnswers} prompt={question.prompt} 
                answer={question.answer} handleAnswer={this.handleAnswer} />
              </Carousel.Item>
            ))} 
        </Carousel>
        <Modal open={this.state.modal} closeModal={this.closeModal} response={this.state.modalHeader}> 
          <p>{this.state.modalText}</p>
          {this.state.complete && (<Button>All Set</Button>)}
        </Modal>
      </div>
    )
  }
}