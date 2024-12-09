local configData = LoadResourceFile(GetCurrentResourceName(), "/config.json")
local Config = json.decode(configData)

local currentDoor = nil

local function hackingCompleted(success)
    TriggerEvent("mhacking:hide")
    if success then
        TriggerServerEvent("brlockpick:openDoor", currentDoor)
    else
        TriggerServerEvent("brlockpick:broLostLmao", Config.items.hacking)
    end
end

RegisterNetEvent("brlockpick:lockpickThatDoor")
AddEventHandler("brlockpick:lockpickThatDoor", function (doorId)
    currentDoor = doorId
    SetNuiFocus(true, true)
    SendNUIMessage({ type = "open" })
    TriggerEvent("dpemote:playemote", "mechanic")
end)

RegisterNUICallback("won", function ()
    TriggerServerEvent("brlockpick:openDoor", currentDoor)
    TriggerEvent("dpemote:stoplatestemote")
    SetNuiFocus(false, false)
end)

RegisterNUICallback("lost", function ()
    TriggerEvent("ox_lib:notify", { title = Config.locale.lockpickBroken })
    TriggerEvent("dpemote:stoplatestemote")
    TriggerEvent("dpemote:playemote", "damn")
    SetNuiFocus(false, false)
    TriggerServerEvent("brlockpick:broLostLmao", Config.items.lockpick)
end)

RegisterNetEvent("br_lockpick:hackDoor")
AddEventHandler("br_lockpick:hackDoor", function (doorId)
    TriggerEvent("mhacking:show")
    currentDoor = doorId
    TriggerEvent("mhacking:start", 3, 60, hackingCompleted)
end)