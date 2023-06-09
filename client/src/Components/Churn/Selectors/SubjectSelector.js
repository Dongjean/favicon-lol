import API from '../../../utils/API.js';

import {useState, useEffect} from 'react';

function SubjectSelector(props) {
    const [AllSubjects, setAllSubjects] = useState([])
    const [SubjectSelection, setSubjectSelection] = useState(props.SubjectSelection)
    
    //calls only on mount
    useEffect(() => {
        getAllSubjects()
    }, [])

    async function getAllSubjects() { //get all Subjects initially to display
        try {
            const result = await API.get('/Categories/Get/Subjects/All')
            setAllSubjects(result.data)
        } catch(err) {
            console.log(err)
        }
    }

    function onSubjectSelected(event) {
        setSubjectSelection(event.target.value)
        props.onSubjectSelected(event.target.value)
    }

    return (
        <div>
            Subject:
            <select value={SubjectSelection} onChange={onSubjectSelected}>
                <option value={0}>Please select a Subject</option>
                {AllSubjects.map(Subject =>
                    <option key={Subject.subjectid} value={Subject.subjectid}>{Subject.subject}</option>
                )}
            </select>
        </div>
    )
}

export default SubjectSelector;