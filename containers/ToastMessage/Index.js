import  { useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { openToast } from "../../store/reducers/toast";

const ToastMessage = () => {
  const dispatch = useDispatch()
  let toastData = useSelector((state) => {
      return state.toast
  });
  useEffect(() => {
    if (toastData.message) {
      if (toastData.type == "warn") toast.warn(toastData.message);
      else if (toastData.type == "error") toast.error(toastData.message);
      else if (toastData.type == "info") toast.info(toastData.message);
      else toast.success(toastData.message);
      setTimeout(() => dispatch(openToast({message:"",type:"success"})), 500);
    }
  },[toastData])
  return null;
};

export default ToastMessage;
