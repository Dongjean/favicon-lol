import {useState, useEffect, useRef} from 'react';

//component imports
import QuestionIMGUploader from './QuestionIMGUploader.js';
import UploadModal from '../Upload/UploadModal.js';

function PostQuestion(props) {
    const [QNImages, setQNImages] = useState([])

    const [isUploadModalOpen, setisUploadModalOpen] = useState(false)

    const isMounted = useRef(false)
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
        } else {
            setQNImages(props.QNImages)
        }
    }, [props.QNImages])

    function AddImage(file) {
        console.log(file)
        var temp = [...QNImages]
        temp.push({FileName: file.name, OriginalIMGData: URL.createObjectURL(file)})
        setQNImages(temp)
        props.onQuestionIMGChange(temp)
    }

    function onQuestionIMGChange(QNImage, index) {
        var temp = [...QNImages]
        temp[index] = QNImage
        setQNImages(temp)
        props.onQuestionIMGChange(temp)
    }

    function OpenUploadModal() {
        setisUploadModalOpen(true)
    }

    function CloseUploadModal() {
        setisUploadModalOpen(false)
    }

    function DeleteImage(index) {
        console.log(QNImages, index)
        console.log(QNImages[index])

        const temp = [...QNImages]
        temp.splice(index, 1)

        setQNImages(temp)
        props.onQuestionIMGChange(temp)
    }

    function MoveImageUp(index) {
        if (index !== 0) {
            const temp = [...QNImages]
            temp[index - 1] = temp[index]
            temp[index] = QNImages[index - 1]
            console.log(temp)
            setQNImages(temp)
            props.onQuestionIMGChange(temp)
        }
    }

    function MoveImageDown(index) {
        const SwapTarget = QNImages[index + 1]
        if (SwapTarget) {
            const temp = [...QNImages]
            temp[index + 1] = temp[index]
            temp[index] = SwapTarget
            console.log(temp)
            setQNImages(temp)
            console.log(QNImages)
            props.onQuestionIMGChange(temp)
        }
    }
    
    return (
        <div>
            {QNImages.length == 0 ?
                //first file upload is required
                <div>
                    <button type='button' onClick={OpenUploadModal}>Upload A File</button>
                    {isUploadModalOpen ?
                        <UploadModal CloseUploadModal={CloseUploadModal} OnUploadImage={file => AddImage(file)} />
                    :
                        null
                    }
                </div>
            :
            <div>
                {QNImages.map((QNImage, index) =>
                    <QuestionIMGUploader key={index} index={index} QNImage={QNImage} onQuestionIMGChange={onQuestionIMGChange} DeleteImage={DeleteImage} MoveImageUp={MoveImageUp} MoveImageDown={MoveImageDown} />
                )}

                <button type='button' onClick={OpenUploadModal}>Upload a New File</button>
                {isUploadModalOpen ?
                    <UploadModal CloseUploadModal={CloseUploadModal} OnUploadImage={file => AddImage(file)} />
                :
                    null
                }
                <br />
            </div>
            }
        </div>
    )
}

export default PostQuestion;