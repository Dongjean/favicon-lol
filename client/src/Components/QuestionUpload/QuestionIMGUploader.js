import {useState, useRef, useEffect} from 'react';
import Cropper from 'react-cropper';
import '../../CSS/Cropperjs/Cropper.css';

//component imports
import UploadModal from '../Upload/UploadModal.js';

function QuestionIMGUploader(props) {
    const [isCropping, setisCropping] = useState(true) //initially image is in crop mode
    const [QNImage, setQNImage] = useState(props.QNImage)

    const [isUploadModalOpen, setisUploadModalOpen] = useState(false)
    const cropperRef = useRef(null)

    useEffect(() => {
        setQNImage(props.QNImage)
        if (!props.QNImage.CroppedIMGData) {
            setisCropping(true)
        } else {
            setisCropping(false)
        }
    }, [props.QNImage])

    function ChangeImage(file, index) {
        const temp = {FileName: file.name, OriginalIMGData: URL.createObjectURL(file)}
        setisCropping(true)
        setQNImage(temp)
        props.onQuestionIMGChange(temp, index)
    }

    function EndCrop() {
        const imageElement = cropperRef.current;
        const cropper = imageElement.cropper;
        const CroppedIMGData = cropper.getCroppedCanvas().toDataURL();
        
        var temp = QNImage
        temp.CroppedIMGData = CroppedIMGData
        setisCropping(false)
        setQNImage(temp)
    }

    function StartCrop() {
        var temp = QNImage
        temp.CroppedIMGData = null
        setisCropping(true)
        setQNImage(temp)
    }

    function OpenUploadModal() {
        setisUploadModalOpen(true)
    }

    function CloseUploadModal() {
        setisUploadModalOpen(false)
    }

    return (
        <div>
            {QNImage.FileName}<br />
            {isCropping ?
                <div>
                    <Cropper
                        src={QNImage.OriginalIMGData} 
                        style={{ height: 400, width: "100%" }}
                        // Cropper.js options
                        autoCropArea={1} //set the cropbox size initially to the image size
                        dragMode='move'
                        cropBoxMovable={false}
                        guides={false}
                        ref={cropperRef}
                        background={false}
                        responsive={false}
                    />
                    <button type='button' onClick={EndCrop}>Crop</button>
                </div>
                :
                <div>
                    <img src={QNImage.CroppedIMGData} style={{width: 500}} />
                    <button type='button' onClick={StartCrop}>Re-Crop</button>
                </div>
            }

            <button type='button' onClick={() => props.MoveImageUp(props.index)}>Move Image Up</button>
            <button type='button' onClick={() => props.MoveImageDown(props.index)}>Move Image Down</button>
            <button type='button' onClick={() => props.DeleteImage(props.index)}>Delete</button>
            <button type='button' onClick={OpenUploadModal}>Change File</button>
            {isUploadModalOpen ?
                <UploadModal CloseUploadModal={CloseUploadModal} OnUploadImage={file => ChangeImage(file, props.index)} />
            :
                null
            }
            <br /><br />
        </div>
    )
}

export default QuestionIMGUploader;