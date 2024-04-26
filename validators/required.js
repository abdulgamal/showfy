var is_date = function(input) {
   if ( Object.prototype.toString.call(input) === "[object Date]" ) 
     return true;
   return false;   
};
export default function validate(inputMain,key) {
   let input = ""+inputMain
   if(!input || !inputMain || typeof input == "undefined"){
      return false
   }else if(typeof input.name != "undefined"){
      return true
   }else if(is_date(input)){
      return true  
   }else if(!input.length){
      return false
   }
   return true;
}