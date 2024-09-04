const request = require('sync-request');
const fs = require('fs');
const path = require('path');
const CConfigureEndpoint = require('./mockups/cconfigureendpoint');
const CConfigureDevice = require('./mockups/cconfiguredevice');
const CHomedDevice = require('./chomeddevice');

class CZ2MConverterToHomedJson
{
  devdir = "/converter/devices";
  resultdir = "/converter/result";

  constructor(url)
  {
    const      fileName = this.devdir    + "/" + path.basename(url);
    this.resultFileName = this.resultdir + "/" + path.basename(url, path.extname(url)) + ".json";
    console.log(`${fileName} -> ${this.resultFileName}`);
    if(!fs.existsSync(fileName))
    {
      console.log("Downloading: ", url);
      this.downloadFile(url, fileName);
    }
    if(fs.existsSync(fileName))
    {
      this.z2m_definition = require(fileName);
    }

    this.homedJson = new CHomedDevice(this.z2m_definition.vendor, this.z2m_definition.description, this.z2m_definition.model);
  }

  downloadFile(url, filename)
  {
    const res = request('GET', url);
    if (res.statusCode !== 200)
    {
      throw new Error(`Ошибка загрузки: ${res.statusCode}`);
    }
    fs.writeFileSync(filename, res.getBody());
  }

  saveAsJson(filePath, content)
  {
    try
    {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Файл успешно сохранен: ${filePath}`);
    }
    catch (err)
    {
      console.error(`Ошибка при записи файла: ${err.message}`);
    }
  }

  jsonPrint(o)
  {
    console.log(JSON.stringify(o, null, 2));
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

  processExposes()
  {
    for (const expose of this.z2m_definition.exposes)
    {
      // const homedExposeName = this.snakeToCamel(expose.name);
      console.log(`Importing expose: ${expose.name}`);
      for (const tz of this.z2m_definition.toZigbee)
      {
        // console.log(tz.key.includes(expose.name));
        if(tz.key.includes(expose.name))
        {
          this.homedJson.addAction(0, expose.name);
        }
      }
      this.homedJson.addExpose(0, expose.name);
      let option = {}
      if('value_min'  in expose) { option['min']  = expose.value_min ; }
      if('value_max'  in expose) { option['max']  = expose.value_max ; }
      if('value_step' in expose) { option['step'] = expose.value_step; }
      if('unit'       in expose) { option['unit'] = expose.unit      ; }
      if('type'       in expose)
      {
        let hType = "";
        switch(expose.type)
        {
          case "binary": hType = this.homedJson.inActions(expose.name) ? "sensor" : "toggle"; break;
          case "numeric": hType = this.homedJson.inActions(expose.name) ? "number" : "sensor"; break;
        }
        if(hType != "")
        {
          option['type'] = hType;
        }
      }
      this.homedJson.addOption(0, expose.name, option);

      // if(expose.name in this.z2m_definition.fromZigbee)
      // {
      //   this.homedJson[this.z2m_definition.vendor][0].properties.push(homedExposeName);
      // }
    }
  }

  processFromZigbee()
  {
    for (const tz of this.z2m_definition.fromZigbee)
    {
    }
  }

  printData(data)
  {
    for (const d of data)
    {
      this.jsonPrint(d);
      if('data' in d) { this.printData(d.data); }
    }
  }

  async configure()
  {
    let device = new CConfigureDevice();
    let coordinator = new CConfigureEndpoint(-1);
    this.z2m_definition.configure(device, coordinator, null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("-----= device =---------");
    this.printData(device.data);
    console.log("-----= coordinator =---------");
    this.printData(coordinator.data);
    this.saveAsJson(this.resultdir + "/device.json", device);
  }

  async run()
  {
    console.log("run");
    this.z2m_definition.icon = "";
    this.jsonPrint(this.z2m_definition);
    // console.dir(this.z2m_definition, { depth: null });
    await this.configure();
    this.processExposes();


    let result = this.homedJson.build();
    this.jsonPrint(result);
    this.saveAsJson(this.resultFileName, result);
  }

};

async function main() {
  try
  {
    let c = new CZ2MConverterToHomedJson("https://raw.githubusercontent.com/smartboxchannel/EFEKTA_iAQ_S_I_II_III/main/z2m_converter/EFEKTA_iAQ_S_III_R4.js");
    c.run();
  }
  catch (error)
  {
    console.error('Ошибка при выполнении run:', error);
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
}

main();


    // пропертис это "прилетел атрибут/команда такого то кластера, распарсили, отправили в мктт"
    // экшнс это "прилетели данные в мктт, запихали в атрибут/команду, отправили в сеть"
    // експозез это "у нас есть лапы, хвост и рога"
    // бингдинс это "температуру, и размер ноги будешь слать мне"
    // репортингс это "влажность будешь слать не реже чем не чаще чем"
    // все, для остального - смотри код
    // еще уточнение - пропертис и экшнс парсеры есть двух видов - прибитые гвоздями в коде и customAttributes/customCommands
    // для ефекты там пополам, в идеале надо вытащить все что есть в кастом атрибутес, но мне лень

    // пропертис это fz
    // экшнс - tz
