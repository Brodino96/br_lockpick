local configData = LoadResourceFile(GetCurrentResourceName(), "/config.json")
local Config = json.decode(configData)
local hackedDoor

ESX = exports["es_extended"]:getSharedObject()

local function getDoors()
    ---@diagnostic disable-next-line: undefined-global
    return MySQL.query.await("SELECT `data`, `id` FROM `ox_doorlock`")
end

---@param doorId integer The ox_doorlock door id
local function openDoor(doorId)
    exports.ox_doorlock:setDoorState(doorId, false)
end

---Checks if the door is closed
---@param doorId integer Door Id
---@return boolean
local function isDoorClosed(doorId)
    if exports.ox_doorlock:getDoor(doorId).state == 1 then
        return true
    end
    return false
end

ESX.RegisterUsableItem(Config.items.lockpick, function(source)

    local allDoors = getDoors()

    if not allDoors then
        return
    end

    local pCoords = GetEntityCoords(GetPlayerPed(source))

    for _, i in ipairs(allDoors) do
        local data = json.decode(i.data)
        local doorCoords = vector3(data.coords.x, data.coords.y, data.coords.z)

        if #(pCoords - doorCoords) > 1.5 then
            goto skip
        end

        if data.lockpick then
            if isDoorClosed(i.id) then
                return TriggerClientEvent("brlockpick:lockpickThatDoor", source, i.id)
            else
                return TriggerClientEvent("ox_lib:notify", source, { title = Config.locale.doorOpen })
            end
        else
            return TriggerClientEvent("ox_lib:notify", source, { title = Config.locale.unpickable })
        end
        ::skip::
    end

    TriggerClientEvent("ox_lib:notify", source, { title = Config.locale.noDoorClose })
end)

ESX.RegisterUsableItem(Config.items.hacking, function (source)
    local allDoors = getDoors()

    if not allDoors then
        return
    end

    local pCoords = GetEntityCoords(GetPlayerPed(source))

    for _, i in ipairs(allDoors) do
        local data = json.decode(i.data)
        local doorCoords = vector3(data.coords.x, data.coords.y, data.coords.z)

        if #(pCoords - doorCoords) > 1.5 then
            goto skip
        end

        if not data.items then
            return TriggerClientEvent("ox_lib:notify", source, { title = Config.locale.unhackable })
        end

        if not isDoorClosed(i.id) then
            return TriggerClientEvent("ox_lib:notify", source, { title = Config.locale.doorOpen })
        end

        for k = 1, #data.items do
            if data.items[k].name == "hacking" then
                return TriggerClientEvent("br_lockpick:hackDoor", source, i.id)
            end
        end

        TriggerClientEvent("ox_lib:notify", source, { title = Config.locale.unhackable })
        ::skip::
    end

    TriggerClientEvent("ox_lib:notify", source, { title = Config.locale.noDoorClose })
end)

RegisterNetEvent("brlockpick:openDoor")
AddEventHandler("brlockpick:openDoor", openDoor)

RegisterNetEvent("brlockpick:broLostLmao")
AddEventHandler("brlockpick:broLostLmao", function (item)
    exports.ox_inventory:RemoveItem(source, item, 1, nil, nil, true)
end)