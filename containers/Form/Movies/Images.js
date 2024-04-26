import React,{useReducer,useEffect,useRef} from 'react'
import Image from "../../Image/Index"
import dynamic from 'next/dynamic'
const imageCompression = dynamic(() => import("browser-image-compression"), {
    ssr: false
});
import swal from "sweetalert"
import axios from "../../../axios-orders"
import Translate from "../../../components/Translate/Index";

const Images = (props) => {
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            images:props.images,
            movie:props.movie
        }
    );

    useEffect(() => {
    if(props.images != state.images){
        setState({
            images:props.images ? props.images : [],                
        })
    }
    },[props.props])
   
    const updateValues = (values) => {
        //update the values
        props.updateSteps({key:"images",value:values})
    }
    const updateState = (data,message) => {
        if(message && data){
            props.openToast({message:Translate(props,message), type:"success"});
        }
        const items = [...state.images]
        items.unshift(data)
        setState({submitting:false})
        updateValues(items)
    }
    const uploadImage = async (picture) =>  {
        var url = picture.target.value;
        let imageFile = ""
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        if (picture.target.files && picture.target.files[0] && (ext === "png"  ||  ext === "webp" || ext === "jpeg" || ext === "jpg" || ext === 'PNG' || ext === 'JPEG' || ext === 'JPG' || ext === 'gif' || ext === 'GIF')) {
            imageFile = picture.target.files[0];
        } else {
            return;
        }

        if(state.submitting){
            return
        }
        setState({submitting:true});

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        }
        let compressedFile = picture.target.files[0];
        if(ext != 'gif' && ext != 'GIF'){
            try { 
            compressedFile = await imageCompression(imageFile, options);
            } catch (error) {
                
            }
        }

        const formData = new FormData()
        formData.append('image', compressedFile,url)

        let uploadurl = '/movies/upload-image/'+state.movie.movie_id


        axios.post(uploadurl, formData)
            .then(response => {
                if (response.data.error) {
                    swal("Error", response.data.error[0].message, "error");
                } else {
                    setState({submitting:false})
                    updateState({...response.data.item},response.data.message)
                }
            }).catch(err => {
                swal("Error", Translate(props, "Something went wrong, please try again later"), "error");
            });

    } 
    const deleteImage = (id,e) => {
        e.preventDefault();

        swal({
            title: Translate(props,"Delete Image"),
            text: Translate(props,"Are you sure you want to delete this image?"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    formData.append('id', id)
                    formData.append('movie_id', state.movie.movie_id);
                    const url = "/movies/delete-image"
                    axios.post(url, formData)
                        .then(response => {
                            if (response.data.error) {
                                swal("Error", Translate(props,"Something went wrong, please try again later", "error"));
                            } else {
                                let message = response.data.message
                                props.openToast({message:Translate(props,message), type:"success"});
                                const items = [...state.images]
                                const itemIndex = items.findIndex(p => p["photo_id"] == id)
                                if(itemIndex > -1){
                                    items.splice(itemIndex, 1)
                                    updateValues(items)
                                }
                            }
                        }).catch(err => {
                            swal("Error", Translate(props,"Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
        const imageref = React.createRef();
        return (
            <div className="movie_photos">
                    <button className="add_photo" onClick={e => {
                                imageref.current.click();
                            }}>
                        {
                            props.t(state.submitting ? "Uploading Image..." : "Upload Image")
                        }
                    </button>
                    <input className="fileNone" onChange={uploadImage} accept="image/*"  ref={imageref} type="file" />
                    <ul className="movie_photos_cnt">
                        {
                            state.images.map((item,index) => {
                                return (
                                    <li className="image" key={item.photo_id}>
                                        <Image className="img" image={item.image} title={""} imageSuffix={props.pageData.imageSuffix} siteURL={props.pageData.siteURL} />
                                        <a href="#" className="btn btn-danger btn-sm" onClick={(e) => deleteImage(item.photo_id,e)}>{props.t("Delete")}</a>
                                    </li>
                                )
                            })
                        }
                    </ul>
            </div>
        )
    }

export default Images