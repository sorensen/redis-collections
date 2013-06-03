-- Collection remove
local collection = KEYS[1]
local member = KEYS[2]
local del = ARGV[1]
-- Determing if the key is a member of the collection, 
-- if so, remove it from the collection and delete the record
if redis.call('ZREM', collection, member) then
  if del then 
    redis.call('DEL', member)
  end
  return 1
end
-- Member was not found
return redis.error_reply('Member does not exist')