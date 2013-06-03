-- Collection loader
local collection = KEYS[1]
local as_list = ARGV[1]
local resp = {}
local members = redis.call('ZRANGEBYSCORE', collection, '-inf', '+inf', 'WITHSCORES')
local len = #members
local i = 0

-- Ensure boolean
if as_list == 'false' then 
  as_list = false
else 
  as_list = true
end

-- Iterate through all members in the collection
while i < len do
  local key = members[i + 1]
  local score = members[i + 2]
  -- Check score to see if a hash based object or string
  if as_list then
    resp[#resp + 1] = redis.call('GET', key)
  else
    local hash = {}
    local obj = redis.call('HGETALL', key)
    local len = #obj
    local i = 0
    -- Iterate through all key val pairs from the loaded hash,
    -- and compose a table from them to add to the response
    while i < len do
      local prop = obj[i + 1]
      local val = obj[i + 2]
      hash[prop] = val
      i = i + 2
    end
    -- Ensure string encoding
    resp[#resp + 1] = cjson.encode(hash)
  end
  i = i + 2
end
return resp
