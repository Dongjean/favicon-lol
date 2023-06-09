import {useParams} from 'react-router-dom';
import {useState, useEffect} from 'react';
import API from '../utils/API';

//component imports
import Question from '../Components/Churn/Question.js';

//Churn Loading GIF import
import ChurnLoadingGIF from '../Images/Loading.gif';

function MyQuestionsPage(props) {
    let {Email} = useParams();
    
    const [isLoading, setisLoading] = useState(true)
    const [MyQuestions, setMyQuestions] = useState()

    //runs only on mount
    useEffect(() => {

        //only get the questions if logged in user is the correct user
        if (props.LoginData.Email == Email) {
            GetMyQuestions(Email)
        }
    }, [])

    async function GetMyQuestions(Email) {
        try {
            const result = await API.get('/Questions/Get/Questions/fromAuthor/' + Email)
            console.log(result.data)
            setMyQuestions(result.data)
            setisLoading(false)
        } catch(err) {
            console.log(err)
        }
    }
    return (
        <div>
            {isLoading ?
                //Loading GIF for first Churn of all of my questions
                <img src={ChurnLoadingGIF} width={20} />
            :
                MyQuestions.Questions.map(question =>
                    <div key={question.questionid}>
                        <button onClick={() => props.OpenQuestion(question.questionid)}>
                            <Question Question={question} FirstQuestionIMG={MyQuestions.QuestionImages.filter(QuestionImage => QuestionImage.QuestionID == question.questionid)[0]} LoginData={props.LoginData} />
                            <br />
                        </button>
                        <br />
                    </div>
                )
            }
        </div>
    )
}

export default MyQuestionsPage;