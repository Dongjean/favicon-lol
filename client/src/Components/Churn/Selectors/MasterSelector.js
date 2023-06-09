//Components imports
import TopicSelector from "./TopicSelector.js";
import SubjectSelector from "./SubjectSelector.js";
import LevelSelector from "./LevelSelector.js";
import PaperSelector from "./PaperSelector.js";
import AssessmentSelector from "./AssessmentSelector.js";
import SchoolSelector from "./SchoolSelector.js";

import {useMemo, useState, useRef} from 'react';
import {useLocation} from "react-router-dom";
import Cookies from '../../../utils/Cookies.js';

function useQuery() {
    const { search } = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
}

function MasterSelector(props) {
    const query = useQuery()

    const [TopicsDisplay, setTopicsDisplay] = useState('none')
    const [LevelsDisplay, setLevelsDisplay] = useState('none')
    const [PapersDisplay, setPapersDisplay] = useState('none')
    const [AssessmentsDisplay, setAssessmentsDisplay] = useState('none')
    const [SchoolsDiplay, setSchoolsDiplay] = useState('none')

    //getting URL query data if it exists, if not set the category selections to an empty selection
    var Subject = 0;
    const SubjectQuery = query.get('Subject')
    if (SubjectQuery) {
        Subject = SubjectQuery
    }
    const [SubjectSelection, setSubjectSelection] = useState(Subject)

    var Topics = [];
    const TopicsQuery = query.get('Topics')
    if (TopicsQuery) {
        Topics = JSON.parse(TopicsQuery)
    }
    const [TopicsSelection, setTopicsSelection] = useState(Topics)

    var Levels = [];
    const LevelsQuery = query.get('Levels')
    if (LevelsQuery) {
        Levels = JSON.parse(LevelsQuery)
    }
    const [LevelsSelection, setLevelsSelection] = useState(Levels)

    var Papers = [];
    const PapersQuery = query.get('Papers')
    if (PapersQuery) {
        Papers = JSON.parse(PapersQuery)
    }
    const [PapersSelection, setPapersSelection] = useState(Papers)

    var Assessments = [];
    const AssessmentsQuery = query.get('Assessments')
    if (AssessmentsQuery) {
        Assessments = JSON.parse(AssessmentsQuery)
    }
    const [AssessmentsSelection, setAssessmentsSelection] = useState(Assessments)

    var Schools = [];
    const SchoolsQuery = query.get('Schools')
    if (SchoolsQuery) {
        Schools = JSON.parse(SchoolsQuery)
    }
    const [SchoolsSelection, setSchoolsSelection] = useState(Schools)

    var QNsperPage = 5; //by default have 5 qns per page
    const QNsperPageQuery = query.get('QNsperPage')
    if (QNsperPageQuery) {
        QNsperPage = QNsperPageQuery
    }
    const QNsperPageRef = useRef(QNsperPage)

    var isChurned = false;
    const isChurnedQuery = query.get('isChurned')
    if (isChurnedQuery) {
        isChurned = (isChurnedQuery =='true')
    }
    const isChurnedRef = useRef(isChurned)
    
    var Pageno = null;
    const PageQuery = query.get('Page')
    if (isChurnedRef.current && PageQuery) { //Page number can only exist when there are questions churned to have pages for
        Pageno = PageQuery
    }
    const PageRef = useRef(Pageno)

    function Churn() {
        var isAllowChurn = false
        if (!props.LoginData.Email) { //if user is a guest,
            const NumberofChurns = Cookies.get('ChurnCount')
            if (!NumberofChurns) { //if there is no cookie for number of churns, create one
                Cookies.set('ChurnCount', 0)
            } else {
                if (parseInt(NumberofChurns) < 5) { //only allow a maximum of 5 churns for guests
                    //Increment the ChurnCount Cookie
                    Cookies.set('ChurnCount', parseInt(NumberofChurns) + 1)

                    //Allow Churning for this guest
                    isAllowChurn = true
                }
            }
        } else { //if user is logged in,
            //Allow Churning for logged in users
            isAllowChurn = true
        }

        if (isAllowChurn) {
            if (
                SubjectSelection !== 0 &&
                TopicsSelection.length !== 0 &&
                LevelsSelection.length !== 0 &&
                PapersSelection.length !== 0 &&
                AssessmentsSelection.length !== 0 &&
                SchoolsSelection.length !== 0
            ) {
                    isChurnedRef.current = true
                    PageRef.current = 1
                    props.setSelection({
                        isFiltered: true,
                        Subject: SubjectSelection,
                        Topics: TopicsSelection,
                        Levels: LevelsSelection,
                        Papers: PapersSelection,
                        Assessments: AssessmentsSelection,
                        Schools: SchoolsSelection,
                        QNsperPage: QNsperPageRef.current,
                        isChurned: isChurnedRef.current,
                        initialPage: PageRef.current
                    })
            } else {
                window.alert('Please Select All Categories')
            }
        } else {
                window.alert('Please Log in to Churn more')
        }
    }

    return(
        <div>
            <SubjectSelector onSubjectSelected={(Subject) => setSubjectSelection(Subject)} SubjectSelection={SubjectSelection} />

            {/* For Displaying Topics */}
            {TopicsDisplay == 'none' ?
                <div> 
                    <a onClick={() => setTopicsDisplay('inline')}>▼ Topics:</a>
                    <br />
                </div>
            :
                <a onClick={() => setTopicsDisplay('none')}>▲ Topics:</a>
            }
            <span style={{display: TopicsDisplay}}>
                <TopicSelector SubjectSelection={SubjectSelection} TopicChanged={(TopicID, ChangeType) => {
                    //ChangeType = true if the Category is to be added
                    //ChangeType = false if the Category is to be removed
                    if (ChangeType) {
                        setTopicsSelection(current => {
                            if (current.includes(parseInt(TopicID))) {
                                return current
                            } else {
                                var temp = [...current]
                                temp.push(parseInt(TopicID))
                                return temp
                            }
                        })
                    } else {
                        setTopicsSelection(current => current.filter(topicid => topicid !== parseInt(TopicID)))
                    }
                }} TopicsSelection={TopicsSelection} />
            </span>

            {/* For Displaying Levels */}
            {LevelsDisplay == 'none' ?
                <div>
                    <a onClick={() => setLevelsDisplay('inline')}>▼ Levels:</a>
                    <br />
                </div>
            :
                <a onClick={() => setLevelsDisplay('none')}>▲ Levels:</a>
            }
            <span style={{display: LevelsDisplay}}>
                <LevelSelector SubjectSelection={SubjectSelection} LevelChanged={(LevelID, ChangeType) => {
                    //ChangeType = true if the Category is to be added
                    //ChangeType = false if the Category is to be removed
                    if (ChangeType) {
                        setLevelsSelection(current => {
                            if (current.includes(parseInt(LevelID))) {
                                return current
                            } else {
                                var temp = [...current]
                                temp.push(parseInt(LevelID))
                                return temp
                            }
                        })
                    } else {
                        setLevelsSelection(current => current.filter(levelid => levelid !== parseInt(LevelID)))
                    }
                }} LevelsSelection={LevelsSelection} />
            </span>

            {/* For Displaying Papers */}
            {PapersDisplay == 'none' ?
                <div>
                    <a onClick={() => setPapersDisplay('inline')}>▼ Papers:</a>
                    <br />
                </div>
            :
                <a onClick={() => setPapersDisplay('none')}>▲ Papers:</a>
            }
            <span style={{display: PapersDisplay}}>
                <PaperSelector SubjectSelection={SubjectSelection} PaperChanged={(PaperID, ChangeType) => {
                    //ChangeType = true if the Category is to be added
                    //ChangeType = false if the Category is to be removed
                    if (ChangeType) {
                        setPapersSelection(current => {
                            if (current.includes(parseInt(PaperID))) {
                                return current
                            } else {
                                var temp = [...current]
                                temp.push(parseInt(PaperID))
                                return temp
                            }
                        })
                    } else {
                        setPapersSelection(current => current.filter(paperid => paperid !== parseInt(PaperID)))
                    }
                }} PapersSelection={PapersSelection} />
            </span>

            {/* For Displaying Assessments */}
            {AssessmentsDisplay == 'none' ?
                <div>
                    <a onClick={() => setAssessmentsDisplay('inline')}>▼ Assessments:</a>
                    <br />
                </div>
            :
                <a onClick={() => setAssessmentsDisplay('none')}>▲ Assessments:</a>
            }
            <span style={{display: AssessmentsDisplay}}>
                <AssessmentSelector LevelsSelection={LevelsSelection} AssessmentChanged={(AssessmentID, ChangeType) => {
                    //ChangeType = true if the Category is to be added
                    //ChangeType = false if the Category is to be removed
                    if (ChangeType) {
                        setAssessmentsSelection(current => {
                            if (current.includes(parseInt(AssessmentID))) {
                                return current
                            } else {
                                var temp = [...current]
                                temp.push(parseInt(AssessmentID))
                                return temp
                            }
                        })
                    } else {
                        setAssessmentsSelection(current => current.filter(assessmentid => assessmentid !== parseInt(AssessmentID)))
                    }
                }} AssessmentsSelection={AssessmentsSelection} />
            </span>

            {/* For Displaying Schools */}
            {SchoolsDiplay == 'none' ?
                <div>
                    <a onClick={() => setSchoolsDiplay('inline')}>▼ Schools</a>
                    <br />
                </div>
            :
                <a onClick={() => setSchoolsDiplay('none')}>▲ Schools</a>
            }
            <span style={{display: SchoolsDiplay}}>
                <SchoolSelector SubjectSelection={SubjectSelection} SchoolChanged={(SchoolID, ChangeType) => {
                    //ChangeType = true if the Category is to be added
                    //ChangeType = false if the Category is to be removed
                    if (ChangeType) {
                        setSchoolsSelection(current => {
                            if (current.includes(parseInt(SchoolID))) {
                                return current
                            } else {
                                var temp = [...current]
                                temp.push(parseInt(SchoolID))
                                return temp
                            }
                        })
                    } else {
                        setSchoolsSelection(current => current.filter(schoolid => schoolid !== parseInt(SchoolID)))
                    }
                }} SchoolsSelection={SchoolsSelection} />
            </span>

            {/* by default have 5 Questions per page if not specified by URL query params */}
            <select defaultValue={parseInt(QNsperPageRef.current)} onChange={event => QNsperPageRef.current = event.target.value}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
            </select>

            <button onClick={Churn}>Churn</button> {/* Button to Churn Questions */}
        </div>
    )
}

export default MasterSelector;