import {useState, useEffect, useRef} from 'react';

//component imports
import AnswerIMGUploader from './AnswerIMGUploader.js';
import UploadModal from '../Upload/UploadModal.js';

function PostAnswer(props) {
    const [ANSImages, setANSImages] = useState([])

    const [isUploadModalOpen, setisUploadModalOpen] = useState(false)

    const isMounted = useRef(false)
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
        } else {
            setANSImages(props.ANSImages)
        }
    }, [props.ANSImages])

    function AddImage(file) {
        console.log(file)
        var temp = [...ANSImages]
        temp.push({FileName: file.name, OriginalIMGData: URL.createObjectURL(file)})
        setANSImages(temp)
        props.onAnswerIMGChange(temp)
    }

    function onAnswerIMGChange(ANSImage, index) {
        var temp = [...ANSImages]
        temp[index] = ANSImage
        setANSImages(temp)
        props.onAnswerIMGChange(temp)
    }

    function OpenUploadModal() {
        setisUploadModalOpen(true)
    }

    function CloseUploadModal() {
        setisUploadModalOpen(false)
    }

    function DeleteImage(index) {
        console.log(ANSImages, index)
        console.log(ANSImages[index])

        const temp = [...ANSImages]
        temp.splice(index, 1)

        setANSImages(temp)
        props.onAnswerIMGChange(temp)
    }

    function MoveImageUp(index) {
        if (index !== 0) {
            const temp = [...ANSImages]
            temp[index - 1] = temp[index]
            temp[index] = ANSImages[index - 1]

            setANSImages(temp)
            props.onAnswerIMGChange(temp)
        }
    }

    function MoveImageDown(index) {
        const SwapTarget = ANSImages[index + 1]
        if (SwapTarget) {
            const temp = [...ANSImages]
            temp[index + 1] = temp[index]
            temp[index] = SwapTarget
            console.log(temp)
            setANSImages(temp)
            console.log(ANSImages)
            props.onAnswerIMGChange(temp)
        }
    }

    return (
        <div>
            {ANSImages.length == 0 ?
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
                {ANSImages.map((ANSImage, index) =>
                    <AnswerIMGUploader key={index} index={index} ANSImage={ANSImage} onAnswerIMGChange={onAnswerIMGChange} DeleteImage={DeleteImage} MoveImageUp={MoveImageUp} MoveImageDown={MoveImageDown} />
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

export default PostAnswer;