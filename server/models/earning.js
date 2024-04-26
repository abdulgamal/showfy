
module.exports = {
    findAll: function(req,data){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                let defaultSymbol = req.defaultCurrency.symbol
                let condition = []
                condition.push(parseInt(data.user_id))
                condition.push(parseInt(data.user_id))
                condition.push(parseInt(data.user_id))
                condition.push(parseInt(data.user_id))
                condition.push(parseInt(data.user_id))
                condition.push(parseInt(data.user_id))

                let sql = "SELECT currency_symbol,change_rate,id,username,displayname,type,amount,admin_commission,creation_date,title,custom_url, transType FROM (SELECT '"+defaultSymbol+"' as currency_symbol,1 as change_rate,video_monetizations.monetization_id as id,userdetails.username,userdetails.displayname,'advertisement' as type,amount,NULL as admin_commission,video_monetizations.creation_date,null as title,null as custom_url,'ads' as transType FROM `video_monetizations` INNER JOIN userdetails on userdetails.user_id = video_monetizations.resource_id WHERE video_monetizations.owner_id = ? "
                sql += "UNION ALL "
                sql += 'SELECT currencies.symbol as currency_symbol,transactions.change_rate, transactions.transaction_id as id,userdetails.username,userdetails.displayname,"video" as type,transactions.price as amount,admin_commission,transactions.creation_date,videos.title,videos.custom_url,transactions.type as transType FROM `transactions` INNER JOIN userdetails on userdetails.user_id = transactions.sender_id INNER JOIN videos ON videos.video_id = transactions.id LEFT JOIN currencies ON currencies.ID = transactions.currency WHERE (transactions.type = "video_purchase" || transactions.type = "video_tip") && (state = "approved" || state = "completed") AND transactions.owner_id = ?  ' 
                
                sql += "UNION ALL "
                sql += 'SELECT currencies.symbol as currency_symbol,transactions.change_rate, transactions.transaction_id as id,userdetails.username,userdetails.displayname,"audio" as type,transactions.price as amount,admin_commission,transactions.creation_date,audio.title,audio.custom_url,transactions.type as transType FROM `transactions` INNER JOIN userdetails on userdetails.user_id = transactions.sender_id INNER JOIN audio ON audio.audio_id = transactions.id LEFT JOIN currencies ON currencies.ID = transactions.currency WHERE transactions.type = "audio_purchase" && (state = "approved" || state = "completed") AND transactions.owner_id = ?  ' 
                
                sql += "UNION ALL "
                sql += 'SELECT currencies.symbol as currency_symbol,transactions.change_rate, transactions.transaction_id as id,userdetails.username,userdetails.displayname,"video" as type,transactions.price as amount,admin_commission,transactions.creation_date,videos.title,videos.custom_url,transactions.type as transType FROM `transactions` INNER JOIN userdetails on userdetails.user_id = transactions.sender_id INNER JOIN videos ON videos.video_id = transactions.id LEFT JOIN currencies ON currencies.ID = transactions.currency WHERE (transactions.type = "video_pay_per_view") && (state = "approved" || state = "completed") AND transactions.owner_id = ?  ' 
                sql += "UNION ALL "
                sql += 'SELECT currencies.symbol as currency_symbol,transactions.change_rate,transactions.transaction_id as id,userdetails.username,userdetails.displayname,"channel" as type,transactions.price as amount,admin_commission,transactions.creation_date,channels.title,channels.custom_url,transactions.type as transType FROM `transactions` INNER JOIN userdetails on userdetails.user_id = transactions.owner_id INNER JOIN channels ON channels.channel_id = transactions.id LEFT JOIN currencies ON currencies.ID = transactions.currency WHERE (transactions.type = "channel_subscription") && (state = "approved" || state = "completed") AND channels.owner_id = ?  ' 
                sql += "UNION ALL "
                sql += 'SELECT currencies.symbol as currency_symbol,transactions.change_rate,transactions.transaction_id as id,userdetails.username,userdetails.displayname,"user" as type,transactions.price as amount,admin_commission,transactions.creation_date,u.displayname as title,userdetails.username as custom_url,transactions.type as transType FROM `transactions` INNER JOIN userdetails on userdetails.user_id = transactions.owner_id INNER JOIN userdetails u ON u.user_id = transactions.id LEFT JOIN currencies ON currencies.ID = transactions.currency WHERE (transactions.type = "user_subscribe") && (state = "approved" || state = "completed") AND transactions.id = ? AND transactions.price > 0  ' 
                sql += "UNION ALL "
                condition.push(parseInt(data.user_id))
                sql += 'SELECT currencies.symbol as currency_symbol,transactions.change_rate,transactions.transaction_id as id,userdetails.username,userdetails.displayname,transactions.type,transactions.price as amount,admin_commission,transactions.creation_date,movies.title,movies.custom_url,transactions.type as transType FROM `transactions` INNER JOIN userdetails on userdetails.user_id = transactions.owner_id INNER JOIN movies ON movies.movie_id = transactions.id LEFT JOIN currencies ON currencies.ID = transactions.currency WHERE ( transactions.type = "purchase_movie_purchase" || transactions.type = "rent_movie_purchase" || transactions.type = "purchase_series_purchase" || transactions.type = "rent_series_purchase" )   && (state = "approved" || state = "completed") AND movies.owner_id = ?  ' 

                sql += "UNION ALL "
                condition.push(parseInt(data.user_id))
                sql += 'SELECT currencies.symbol as currency_symbol,transactions.change_rate, transactions.transaction_id as id,userdetails.username,userdetails.displayname,"gift" as type,transactions.price as amount,admin_commission,transactions.creation_date,videos.title,videos.custom_url,transactions.type as transType FROM `transactions` INNER JOIN userdetails on userdetails.user_id = transactions.sender_id INNER JOIN videos ON videos.video_id = transactions.tip_id LEFT JOIN currencies ON currencies.ID = transactions.currency WHERE (transactions.type = "gift") && (state = "approved" || state = "completed") AND transactions.owner_id = ?  ' 
                

                sql += " ) as t order by creation_date DESC "

                if(data.limit)
                sql += " limit "+data.limit 
                
                if(data.offset)
                    sql += " offset "+data.offset

                connection.query(sql ,condition,function(err,results,fields)
                {
                    if(err){
                      console.log(err)
                      resolve(false)
                    }
                    if(results){
                        const earnings = JSON.parse(JSON.stringify(results));
                        resolve(earnings);
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    }
}
