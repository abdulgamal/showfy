import React,{useReducer} from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router';
import { useSelector } from "react-redux";

const PWAPrompt = dynamic(() => import("react-ios-pwa-prompt"), {
    ssr: false
  });

const Content = dynamic(() => import("./Content"), {
    ssr: false 
});

const LoginPopup = dynamic(() => import("../Login/Popup"), {
    ssr: false 
  });

const SignupPopup = dynamic(() => import("../Signup/Popup"), {
    ssr: false
});

const ToastMessage = dynamic(() => import("../ToastMessage/Index"), {
    ssr: false
});

const ToastContainer = dynamic(() => import("../ToastMessage/Container"), {
    ssr: false
});

const Playlist = dynamic(() => import("../Video/Playlist"), {
    ssr: false
});

const RatingStats = dynamic(() => import("../Rating/Stats"), {
    ssr: false
});

const SocialShare = dynamic(() => import("../SocialShare/Footer"), {
    ssr: false
});
const Report = dynamic(() => import("../Report/Index"), {
    ssr: false
}); 
import axios from "../../axios-orders"

const FullPageSearch = dynamic(() => import("../Footer/FullPageSearch"), {
    ssr: false
  });
const Index = (props) => {
    
    let searchClicked = useSelector((state) => {
        return state.search.searchClicked;
    });
    let playlistClicked = useSelector((state) => {
        return state.playlist.playlistClicked;
    });
    let playlistVideoId = useSelector((state) => {
        return state.playlist.video_id;
    });
    let ratingRedux = useSelector((state) => {
        return state.rating;
    });
    
    let reportRedux = useSelector((state) => {
        return state.report.status;
    });
    let shareRedux = useSelector((state) => {
        return state.share;
    });
    
   
    const [state, setState] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            adult:props.pageData.adultAllowed ? true : false,
                previousUrl:typeof window != "undefined" ? Router.asPath : ""
        }
    );
    const allowAdultContent = (e) => {
        setState({adult:!state.adult})
        const formData = new FormData()
        formData.append('adult', !state.adult ? 1 : 0)            
        let url = '/members/adult'
        axios.post(url, formData)
            .then(response => {
                Router.push( state.previousUrl ? state.previousUrl : Router.asPath)
            })
        
    }


        return (
            <React.Fragment>
                {
                    props.pageData.appSettings["fixed_header"] != 1 ? 
                        <Content  {...props} allowAdultContent={allowAdultContent} adultChecked={state.adult} />
                    : 
                        null
                }
                {
                    searchClicked && props.pageData.appSettings['fixed_header'] == 1 ? 
                        <FullPageSearch {...props} />
                    : null
                }
                {
                    !props.pageData.loggedInUserDetails ?
                        <React.Fragment>
                            {
                                !props.loginButtonHide ?
                                    !props.redirectLogin ?
                                    <LoginPopup {...props} router={Router} />
                                : null
                                : null
                            }
                                {
                                !props.signButtonHide && props.pageData.appSettings['member_registeration'] == 1 ?
                                    !props.redirectLogin ?
                                        <SignupPopup  {...props} router={Router} />
                                    : null
                                : null
                                }
                        </React.Fragment>
                        : null
                }

                {
                    playlistClicked && playlistVideoId != 0 ?
                        <Playlist {...props} playlistVideoId={playlistVideoId} />
                        : null
                }
                
                <ToastContainer {...props} />
                {
                    <ToastMessage {...props} />
                }
                {
                    ratingRedux.status ?
                        <RatingStats  {...props} ratingData={ratingRedux} />
                        : null
                }
                {
                    reportRedux ? 
                    <Report {...props} />
                    : null
                }
                {
                    shareRedux.status ?
                        <React.Fragment>
                            <SocialShare {...props} shareData={shareRedux.data} countItems="all" checkcode={true} />
                        </React.Fragment>
                        : null
                }
                {
                    props.pageData.appSettings["pwa_app_name"] && !props.pageData.fromAPP ? 
                        <PWAPrompt copyTitle={props.t("Add to Home Screen")} 
                        copyBody={props.t("Add it to your home screen to use it in fullscreen and while offline.")} 
                        copyShareButtonLabel={props.t("1) Press the 'Share' button")} copyAddHomeButtonLabel={props.t("2) Press 'Add to Home Screen'")}
                        copyClosePrompt={props.t("Cancel")} timesToShow={50} permanentlyHideOnDismiss={true} />
                    : null
                }
            </React.Fragment>
        )
    }


export default Index