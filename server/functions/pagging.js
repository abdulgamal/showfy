
exports.create = (req,totalCount,currentPage = 1,pageUri = "/",perPage=10,customParam = "") => {
    if(totalCount <= perPage){
        return ""
    }
    totalCount =parseInt(totalCount);
    currentPage = parseInt(currentPage);
    let previousPage = currentPage - 1;
    let nextPage = currentPage + 1;
    let pageCount = Math.ceil(totalCount / perPage);
    let offset  = currentPage > 1 ? previousPage * perPage : 0;
    let sidePages = 5;
    let pages = false;
    let url  = process.env.PUBLIC_URL + req.originalUrl
    let queryString = ""
    if(url.indexOf('?') > -1){
        const dataUrl = url.split('?')
        queryString = "?"+dataUrl[1]
        url = dataUrl[0]
    }
   
    const subString = url.toString().charAt(url.toString().length - 1)
    if(parseInt(subString) === parseInt(subString, 10)){
        url = url.toString().substr(0, url.toString().lastIndexOf("/"))
    }
    if(customParam){
        url = url.toString().substr(0, url.toString().lastIndexOf("/"))
    }
    //check last character
    const lastString = url.toString().charAt(url.toString().length - 1)
    if(lastString != "/"){
        url = url + "/"
    }
    pageUri = url+customParam

    pages='<ul class="pagination pagination-md">';

    if(currentPage - sidePages > 1)
        pages+='<li class="page-item"><a class="page-link" href="'+pageUri + '1'+queryString+'">First</a></li>';


    if(previousPage > 0)
        pages+='<li class="page-item"><a class="page-link" id="previous-page" href="'+pageUri + previousPage+queryString+'">Previous</a></li>';


        /*Add back links*/
        if(currentPage > 1){
            for (var x = currentPage - sidePages; x < currentPage; x++) {
                if(x > 0)
                    pages +='<li class="page-item"><a class="page-link" href="'+pageUri+x+queryString+'">'+x+'</a></li>';
            }
        }

        /*Show current page*/
        pages +='<li class="page-item active"><a class="page-link" href="'+pageUri+currentPage+queryString+'">'+currentPage+'</a></li>';

        /*Add more links*/
        for(x = nextPage; x <= pageCount; x++){

            pages +='<li class="page-item"><a class="page-link" href="'+pageUri+x+queryString+'">'+x+' </a></li>';

            if(x >= currentPage + sidePages)
                break;
        }


        /*Display next buttton navigation*/
        if(currentPage + 1 <= pageCount)
            pages+='<li class="page-item"><a class="page-link" id="next-page" href="'+pageUri+nextPage+queryString+'">Next</a></li>';

        if(pageCount > x)
            pages+='<li class="page-item"><a class="page-link" href="'+pageUri + pageCount+queryString+ '">Last</a></li>';
        
        pages+='</ul>';

    return pages;
}