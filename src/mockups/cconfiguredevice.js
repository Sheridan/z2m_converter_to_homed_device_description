const CConfigureEndpoint = require('./cconfigureendpoint');

class CConfigureDevice
{
  data = []
  getEndpoint(id)
  {
    let obj =
    {
      'endpoint_id': id,
      'endpoint': new CConfigureEndpoint(id)
    };
    this.data.push(obj);
    return obj.endpoint;
  }
};

module.exports = CConfigureDevice;
