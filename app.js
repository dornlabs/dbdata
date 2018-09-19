const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
const mongoUriBuilder = require( 'mongo-uri-builder' );

function returnConnectionStringReplica(){
    return mongoUriBuilder(
        {  
            host: "dornhost.com",
            port: 37021,
            database: 'proof',
     });    
}
function getDbPromise( _prop1, _prop2 ) {      
    let url = _prop1;
    let dbname  = _prop2;
        console.log( "Mongodb attempted connection to: " , url, " dbname: ", dbname , " in accessDbAsyncAndExecCallBacks" )
        return new Promise ( ( resolve , reject )=>{
            try{
                MongoClient.connect( url , { useNewUrlParser: true } , ( err, conndb )=>{
                    let db = conndb.db( dbname );
                    if ( db!=null && typeof(db) != undefined ){
                            resolve( db );
                            } 
                        else if ( db==null && typeof(db) == undefined ){
                            reject( db ); 
                            }
                        });
                    }catch( _err ) {
                            console.log( "Mongodb error connecting to: ", url ," dbname: ", dbname );
                            console.log( "Exception caught and passed: " + _err );                        
                    }
            });
}
function main(){
    let express = require('express')
    let app = express()
    let http = require('http').createServer( app ).listen( 10001 , console.log("server up")  );
    let io = require('socket.io').listen( http );
    
    io.on( 'connection' ,  ( _socket )  => {
        
        let args = [ app , io , _socket ]
        
        setImmediate(  ( _args )=>{
            
            let socket = _args[2]
            
            socket.on( 'dbdata' , ( _msg , _rinfo ) => {
                
                console.log("message in: " +JSON.stringify(_msg)); 
                
                let rec_message_package =   _msg;
                
                if ( rec_message_package.event == "dbdata" ){
                    let document = {
                        title           :          rec_message_package.title,
                        ip              :          rec_message_package.ip,
                        url             :          rec_message_package.url,
                        source          :          rec_message_package.source,
                        tags            :          rec_message_package.tags,
                        location        :          rec_message_package.location,
                        metadata        :          rec_message_package.metadata, 
                        text            :          rec_message_package.text,
                        links           :          rec_message_package.links,
                    };
                
                    let dbpromise       =  getDbPromise( returnConnectionStringReplica() , "ai" ); 
                    let runAync         =  async function(){
                        let db1         =  await dbpromise;
                        await db1.collection( "ai" ).insertOne( document , function(_err, _res){
                            if ( _err ){
                            console.log ( "Document error: " + JSON.stringify( _err ) );    
                            throw _err;
                        }
                            console.log ( "Document inserted: " + JSON.stringify( rec_message_package ) );
                        });
                    };
                
                    runAync();
                    setTimeout( ()=>{
                        delete dbpromise;                 
                    } , 1500 )          
                }
        });

        socket.on( 'message' ,( _msg , _rinfo ) => {

            console.log("message in: " + JSON.stringify(_msg)); 

            let rec_message_package =   _msg;

            if ( rec_message_package.event == "message" ){

                console.log("got a message")

            };

        });

    } , args );

});

}();
