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
var client      = new JsonSocket( new net.Socket() ),
    net_port    = 9838,
    host        = 'localhost';
/* Settings */
client.connect( net_port, host );
/* Events */
client.on('connect', function() 
{
    logger.trace('connection established in client...');

    try
    {
        client.sendMessage({command:'start'});
        logger.trace('send message start...');    
    }
    catch( e )
    {
        logger.fatal( e );
    }
    

    client.on('message', function(message) 
    {
        try
        {
            logger.trace( message.type );

            client.sendMessage({command:'ping'});
            logger.trace('send message ping...');
        }
        catch( e )
        {
            logger.fatal( e );
            client.sendMessage({command:'start'});
        }
    });

    client.on('error', function(err) 
    {
        switch( err.code )
        {
            case "ENOTFOUND":
                logger.fatal( "[ERROR ENOTFOUND] No device found at this address!" );
            break;
            case "ECONNREFUSED":
                logger.fatal( "[ERROR ECONNREFUSED] Connection refused! Please check the IP." );
            break;
            case "SOCKETCLOSE":
                logger.fatal( "[ERROR SOCKETCLOSE] Connection is Closed." );
            break;
            case "SOCKETTIMEOUT":
                logger.fatal( "[ERROR SOCKETTIMEOUT] Attempt at connection exceeded timeout value" );
            break;
        }

        //jSocket.destroy();
        logger.fatal("[CONNECTION] Unexpected error! " + err.message + " RESTARTING SERVER");
        //jSocket.sendMessage({command:'restart'});
    });

    client.on('disconnect', function() 
    {
        logger.fatal("[CONNECTION] disconnected!");
    });

    client.on('end', function() 
    {
        logger.fatal("[CONNECTION] end!");
        // jSocket = initServer();
        // jSocket.sendMessage({command:'restart'});

        client.connect( net_port, host );
    });
});