
class CHomedDevice
{
  endpoints = {}

  constructor(vendor, description, modelName)
  {
    this.vendor = vendor;
    this.description = this.extractText(description);
    this.modelName = modelName;
  }

  ensureEndpointExists(endpointId)
  {
    if(!(endpointId in this.endpoints))
    {
      this.endpoints[endpointId] = {
        "actions": [],
        "bindings": [],
        "endpointId": endpointId,
        "exposes": [],
        "modelNames": [this.modelName],
        "options": {},
        "properties": [],
        "reportings": [],
      };
      if(endpointId == 0)
      {
        this.endpoints[endpointId]["description"] = this.description;
      }
    }
  }

  addItem(type, endpointId, name)
  {
    this.ensureEndpointExists(endpointId);
    this.endpoints[endpointId][type].push(this.snakeToCamel(name));
  }

  addAction    (endpointId, name) { this.addItem("actions"   , endpointId, name); }
  addBinding   (endpointId, name) { this.addItem("bindings"  , endpointId, name); }
  addExpose    (endpointId, name) { this.addItem("exposes"   , endpointId, name); }
  addProperties(endpointId, name) { this.addItem("properties", endpointId, name); }
  addReportings(endpointId, name) { this.addItem("reportings", endpointId, name); }

  addOption(endpointId, name, data)
  {
    this.ensureEndpointExists(endpointId);
    this.endpoints[endpointId].options[this.snakeToCamel(name)] = data;
  }

  inItems(type, name)
  {
    let ccName = this.snakeToCamel(name);
    for (const key in this.endpoints)
    {
      if(this.endpoints[key][type].includes(ccName))
      {
        return true;
      }
    }
    return false;
  }

  inActions   (name) { return this.inItems("actions"   , name); }
  inBindings  (name) { return this.inItems("bindings"  , name); }
  inExposes   (name) { return this.inItems("exposes"   , name); }
  inProperties(name) { return this.inItems("properties", name); }
  inReportings(name) { return this.inItems("reportings", name); }

  build()
  {
    let result = [];
    for (const key in this.endpoints)
    {
      result.push(this.endpoints[key]);
    }
    return {
      [this.vendor]: result
    };
  }

  snakeToCamel(snakeStr)
  {
    return snakeStr
      .split('_')
      .map((word, index) =>
      {
        if (index === 0)
        {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  extractText(input)
  {
    const match = input.match(/\[(.*?)\]/);
    return match ? match[1] : input;
  }
};

module.exports = CHomedDevice;
