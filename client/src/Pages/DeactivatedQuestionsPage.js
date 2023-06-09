import {useNavigate} from 'react-router-dom';
import {useState, useEffect, useRef} from 'react';
import API from '../utils/API';
import useQuery from '../utils/useQuery';

//component imports
import MasterSelector from '../Components/Churn/Selectors/MasterSelector';
import ChurnedQuestions from "../Components/Churn/ChurnedQuestions";

//Churn Loading GIF import
import ChurnLoadingGIF from '../Images/Loading.gif';

function DeactivatedQuestionsPage(props) {
    const query = useQuery();
    const navigate = useNavigate();

    const [isLoading, setisLoading] = useState(true)
    const [DeactivatedQuestions, setDeactivatedQuestions] = useState()

    const [isFiltering, setisFiltering] = useState(false)
    
    const [Selection, setSelection] = useState({
        isChurned: query.get('isChurned') == 'true' || false,
        isFiltered: query.get('isFiltered') == 'true' || false,
        QNsperPage: parseInt(query.get('QNsperPage')) || 5,
        Page: parseInt(query.get('Page')),

        Subject: JSON.parse(query.get('Subject')) || null,
        Topics: JSON.parse(query.get('Topics')) || null,
        Levels: JSON.parse(query.get('Levels')) || null,
        Papers: JSON.parse(query.get('Papers')) || null,
        Assessments: JSON.parse(query.get('Assessments')) || null,
        Schools: JSON.parse(query.get('Schools')) || null
    })

    const [CurrURL, setCurrURL] = useState('/Admin/Questions/Deactivated')

    const [isChurnLoading, setisChurnLoading] = useState(false)

    function navigator(Queries) {
        setCurrURL('/Admin/Questions/Deactivated' + Queries)
    }

    const isFirstMountRef = useRef(true)
    useEffect(() => {
        if (isFirstMountRef.current) {
            isFirstMountRef.current = false
        } else {
            console.log(CurrURL)
            navigate(CurrURL)
        }
    }, [CurrURL])

    useEffect(() => {
        if (Selection.isFiltered) {
            GetQueriedDeactivatedQuestions(Selection)
        } else {
            GetAllDeactivatedQuestions()
        }
    }, [Selection])

    async function GetAllDeactivatedQuestions() {
        try {
            const result = await API.get('/Questions/Get/Questions/Deactivated/All')
            console.log(result.data)
            setDeactivatedQuestions(result.data)

            const temp = Selection
            temp.isChurned = true
            console.log(temp.Page)
            temp.Page = temp.Page || 1
            setSelection(temp)
            console.log(temp)
            setisLoading(false)
        } catch(err) {
            console.log(err)
        }
    }

    async function GetQueriedDeactivatedQuestions(Selection) {
        console.log('hello')
        try {
            const Queries = '?' +
            'Topics=' + JSON.stringify(Selection.Topics) + '&' +
            'Levels=' + JSON.stringify(Selection.Levels) + '&' +
            'Papers=' + JSON.stringify(Selection.Papers) + '&' +
            'Assessments=' + JSON.stringify(Selection.Assessments) + '&' +
            'Schools=' + JSON.stringify(Selection.Schools)

            setisChurnLoading(true)
            const result = await API.get('/Questions/Get/Questions/Deactivated/Filtered' + Queries)
            setisChurnLoading(false)
            console.log(result.data)
            setDeactivatedQuestions(result.data)
            
            const temp = Selection
            temp.isChurned = true
            console.log(temp.Page)
            temp.Page = temp.Page || 1
            setSelection(temp)
            console.log(temp)
            
            setisLoading(false)
        } catch(err) {
            console.log(err)
            if (isChurnLoading) {
                setisChurnLoading(false)
            }
        }
    }

    return (
        <div>
            {isLoading ?
                //Loading GIF for first Churn of all Deactivated questions
                <img src={ChurnLoadingGIF} width={20} />
            :
                <div>
                    {isFiltering ?
                        <div>
                            <MasterSelector LoginData={props.LoginData} OpenQuestion={props.OpenQuestion} navigator={navigator} setSelection={setSelection} />
                            <button onClick={() => setisFiltering(false)}>Close Filters</button>
                        </div>
                    :
                        <div>
                            <button onClick={() => setisFiltering(true)}>Open Filters</button>
                        </div>
                    }

                    {/* Loading GIF for subsequent filtered churns of Deactivated questions */}
                    {isChurnLoading ?
                        <img src={ChurnLoadingGIF} width={20} />
                    :
                        null
                    }

                    <ChurnedQuestions
                        Churned={DeactivatedQuestions}
                        OpenQuestion={(QuestionID) => props.OpenQuestion(QuestionID)}
                        Selection={Selection}
                        LoginData={props.LoginData}
                        navigator={navigator}
                    />
                </div>
            }
        </div>
    )
}

export default DeactivatedQuestionsPage;