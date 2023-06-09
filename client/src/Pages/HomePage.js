import {useNavigate} from "react-router-dom";
import {useState, useEffect} from 'react';
import API from '../utils/API.js';
import useQuery from "../utils/useQuery.js";

//component imports
import MasterSelector from '../Components/Churn/Selectors/MasterSelector';
import ChurnedQuestions from "../Components/Churn/ChurnedQuestions";

//Churn Loading GIF import
import ChurnLoadingGIF from '../Images/Loading.gif';

function HomePage(props) {
    const query = useQuery();
    const navigate = useNavigate();

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

    const [CurrURL, setCurrURL] = useState('/')

    const [Churned, setChurned] = useState()

    const [isChurnLoading, setisChurnLoading] = useState(false)

    function navigator(Queries) {
        console.log(Queries)
        setCurrURL('/' + Queries)
    }

    useEffect(() => {
        console.log(CurrURL)
        navigate(CurrURL)
    }, [CurrURL])

    useEffect(() => {
        if (Selection.isChurned) {
            GetChurnedQuestions(
                Selection.Topics,
                Selection.Levels,
                Selection.Papers,
                Selection.Assessments,
                Selection.Schools
            )
        }
    }, [Selection])

    async function GetChurnedQuestions(TopicsSelection, LevelsSelection, PapersSelection, AssessmentsSelection, SchoolsSelection) {
        try {
            const Queries = '?' +
                'Topics=' + JSON.stringify(TopicsSelection) + '&' +
                'Levels=' + JSON.stringify(LevelsSelection) + '&' +
                'Papers=' + JSON.stringify(PapersSelection) + '&' +
                'Assessments=' + JSON.stringify(AssessmentsSelection) + '&' +
                'Schools=' + JSON.stringify(SchoolsSelection)
            
            setisChurnLoading(true)
            const result = await API.get('/Questions/Get/Questions/Filtered' + Queries)
            setisChurnLoading(false)
            console.log(result.data)
            const temp = Selection
            temp.isChurned = true
            temp.Page = temp.Page || 1
            setSelection(temp)

            setChurned(result.data)
        } catch(err) {
            console.log(err)
            if (isChurnLoading) {
                setisChurnLoading(false)
            }
        }
    }

    return(
        <div>
            <MasterSelector LoginData={props.LoginData} OpenQuestion={props.OpenQuestion} navigator={navigator} setSelection={setSelection} />
            
            {/* Loading GIF */}
            {isChurnLoading ?
                <img src={ChurnLoadingGIF} width={20} />
            :
                null
            }

            <ChurnedQuestions
                Churned={Churned}
                OpenQuestion={(QuestionID) => props.OpenQuestion(QuestionID)}
                Selection={Selection}
                LoginData={props.LoginData}
                navigator={navigator}
            />
        </div>
    )
}

export default HomePage;