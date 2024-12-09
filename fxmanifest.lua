fx_version "cerulean"
game "gta5"

author "Brodino"
description "Lockpicking system based on ox_doorlock"

client_scripts {
    "client.lua",
}

server_scripts {
    "@oxmysql/lib/MySQL.lua",
    "server.lua",
}

files{
    "config.json",
    "NUI/index.html",
    "NUI/collar.png",
    "NUI/cylinder.png",
    "NUI/pinBott.png",
    "NUI/pinTop.png",
    "NUI/driver.png",
    "NUI/script.js",
    "NUI/style.css",
    "NUI/TweenMax.min.js",
}

ui_page "NUI/index.html"