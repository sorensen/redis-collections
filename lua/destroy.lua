-- Collection destroy
local collection = KEYS[1]
local members = redis.call('ZRANGEBYSCORE', collection, '-inf', '+inf')
local resp = 0
-- Iterate through all members of the collection
for _, key in ipairs(members) do
  resp = resp + tonumber(redis.call('DEL', key))
end
redis.call('DEL', collection)
return resp