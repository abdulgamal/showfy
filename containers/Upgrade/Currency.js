
const Currency = (props) => {
        let price = props.package && props.package.price ? props.package.price : props.price
        if(!parseFloat(price)){
            price = 0
        }
        let changedPrice = props.currency_value ? props.currency_value : parseFloat(props.pageData.selectedCurrency.currency_value)
        
        // let currency = props.pageData.appSettings.payment_default_currency;
        let currenctCurrency = props.currency_symbol ? props.currency_symbol : props.pageData.selectedCurrency.symbol
        if(props.returnPriceOnly){
            return (price*changedPrice).toFixed(2);
        }
        return currenctCurrency+new Intl.NumberFormat().format((price*changedPrice).toFixed(2));

        return new Intl.NumberFormat(props.language ? props.language : "en", {
            style: 'currency',
            currency: currency
          }).format(price);   
}


export default Currency;