# server-rock_paper_scissors_battle
Simulator and animator of Rock-Paper-Scissors, on a expressJS and WebSocket server

This server-http_ws aims to provide a web based game, that has server and client sides.  
However, it will be different than the older pck_web_games that I have done before.  
The pck_web_games runs separate server and client, i.e. server runs in nodejs express as an api server, while client runs as a react based web app.  
This server-http_ws aims to run everything with a single process, i.e. the nodejs express server.  
It contains both an HTTP server that serves a landing page html page, where inside it will import different javascript libraries.  
It also runs a simple HTTP API server that serves some admin API, like getting the overall status of the server.  
It also runs a web socket server that is used by all the clients to connect to.  
This project demonstrate the ability to run everything in just one server process, making it simpler to manage (i.e. no need to run 2 processes, a server and a client web)  
I want to see whether this will work.  

To run this server
-
Check out notes/to_run.txt for instructions to set up and run this project.  
Basically, it is a node express server, so typical "npm" commands are all you need.  

To access the page
-
From a web browser, and given the IP address, you may access the app in 2 ways:
(1) client mode, where it connects to the server to get and push updates of the battle
(2) standalone mode, where it just runs the battle by itself

Client mode
-
http://\<ip address\>:\<port\>  

For example, given IP address "localhost" and port "8080"  
http://localhost:8080  

Standalone mode
-
http://\<ip address\>:\<port\>/rps-local.html  

For example, given IP address "localhost" and port "8080"  
http://localhost:8080/rps-local.html  

<img width="585" alt="image" src="https://github.com/user-attachments/assets/007b4fa2-a395-4e52-9150-df8fd6d65620" />


