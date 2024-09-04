class CConfigureEndpoint
{
  data = []
  constructor(id)
  {
    this.data.push({"id": id});
  }

  bind(cluster, target)
  {
    let obj = {
      'type': 'bind',
      'cluster': cluster,
      'target': target
    };
    this.data.push(obj);
    return new Promise(resolve => setTimeout(resolve, 1));
  }

  configureReporting(cluster, payload)
  {
    let obj = {
      'type': 'configureReporting',
      'cluster': cluster,
      'payload': payload
    };
    this.data.push(obj);
    return new Promise(resolve => setTimeout(resolve, 1));
  }
};

module.exports = CConfigureEndpoint;
