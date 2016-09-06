"use strict";

/**********************************************************/
/*                      LIBRARIES                         */
/**********************************************************/
var net         = require('net'),
    JsonSocket  = require('json-socket'),
    Q           = require("q"),
    log4js      = require('log4js');


/**********************************************************/
/*                     LOG CONFIG                         */
/**********************************************************/
log4js.configure({
  appenders: [
    { type: 'console' },
    //{ type: 'file', filename: 'logs/server.log', category: 'server' }
  ]
});    

var logger = log4js.getLogger('SERVER');

/**********************************************************/
/*                     TCP SERVER                         */
/**********************************************************/
/* Inicialize */
var server  = net.createServer(),
    port    = 9838,
    timeout = 1;
/* Settings */
server.listen( port );
/* Events */
server.on('connection', function(socket) 
{
    logger.trace('connection established in server...');

    socket = new JsonSocket(socket);
    socket.on('message', function(message) 
    {
        try
        {
            switch (message.command)
            {
                case 'start':
                    logger.trace("Request: [Command Start]");
                break;
                case 'ping':
                    logger.trace("Request: [Command Ping]");
                break;
                case 'restart':
                    logger.trace("Request: [Command Restart]");
                break;
            }

            callXML( timeout )
                .then( function ( connData )
                {
                    try
                    {
                        socket.sendMessage({type:'ping', data:connData});
                        logger.info("Response: [Command ping]");
                        //server.emit('error', new Error('error...'));
                    }
                    catch( e )
                    {
                        logger.fatal("JSON, mal formado");
                        logger.fatal(e);
                        //socket.sendMessage({type:'error', error: "Json, mal formado"});
                    }
                })
                .fail( function ( err ) 
                {
                    logger.error( err );

                    /* Aux Data */
                    connData = exit;
                    /* Reseteamos los datos */
                    exit = [];

                    socket.sendMessage({type: 'error', error: "Ocurrio un error inexperado[001]"});
                });
        }
        catch(e)
        {
            socket.sendMessage({type: 'error', error: "Ocurrio un error inexperado[002]"});
        }
    });

    socket.on('error', function(err)
    {
        logger.error( err );
        logger.info("[Command Error]");
        socket.sendMessage({type:'error', error: "Json, mal formado"});
    });

    socket.on('end', function () 
    {
        console.log('server disconnected..');
        socket.sendMessage({type:'end', error: "Socket finalizado"});
    });
});

server.on('error', function(err)
{
    logger.info("[Server Error]");
    logger.fatal(err);
});

server.on('end', function()
{
    console.log('server disconnected..');
})

var callXML = function ( timeout )
{
    var defer = Q.defer();

    setTimeout( function()
    {
        return defer.resolve(["uno","dos","tres"]);
    }, timeout );

    return defer.promise;
};