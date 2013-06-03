-- Collection save
local collection = KEYS[1]
local key = KEYS[2]
local data = ARGV[1]
local score = ARGV[2]
local as_list = ARGV[3]
local kwargs = nil

-- Ensure boolean
if as_list == 'false' then 
  as_list = false
else 
  as_list = true
end

-- Determine if the data is an object or just a plain string, 
-- if its an object, use HMSET to preserve data properties, 
-- otherwise, save it as a pure string
if as_list then
  kwargs = {'SET', key, data}
else
  -- Compose an array for saving hash values correctly
  kwargs = {'HMSET', key}
  for prop, val in pairs(cjson.decode(data)) do
    kwargs[#kwargs + 1] = prop
    kwargs[#kwargs + 1] = val
  end
end
-- Add the member to the sorted set, the score will represent
-- whether or not the value is a key or hash
if tonumber(redis.call('ZADD', collection, score, key)) == 1 then
  redis.call(unpack(kwargs))
  return 1
end
return redis.error_reply('Member already exists')