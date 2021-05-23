import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Graphic = require("esri/Graphic");
import Viewpoint = require("esri/Viewpoint");
import Locator = require("esri/tasks/Locator");
import Color = require("esri/Color");
import { SimpleMarkerSymbol } from "esri/symbols";

(async () => {

  const map = new EsriMap({
    basemap: "streets"
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    viewpoint: Viewpoint.fromJSON({"rotation":0,"scale":36978595.474472,"targetGeometry":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":-10984650.679317374,"y":5097967.601478441}})
  });

  view.watch("center", (center) => {
    console.log(JSON.stringify(view.viewpoint));
  });

  const addresses = {
    Solveig: "7831 Gray Eagle drive, Zionsville, IN 46077",
    Joanna: "Springville, UT",
    Rebecca: "Chandler, AZ",
    Erik: "South Ogden, UT",
    Ben: "4762 E TIMBERLINE RD, GILBERT, AZ 85297",
    Spencer: "Mesa, Arizona",
    Kristian: "10427 Beryl Ave., Mentone, CA 92359",
    Alan: "Arizona City, AZ"
  };

  const locator = new Locator({
    url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
  });

  const calculateButton = document.getElementById("calculate") as HTMLButtonElement;
  view.ui.add(calculateButton, "bottom-left");
  calculateButton.addEventListener("click", addressesOnMap);

  async function calculateAddressLocation(person: string){
    const SingleLine = addresses[person];
    const [ response ] = await locator.addressToLocations({
      address: {
        SingleLine
      },
      maxLocations: 1
    });
    return new Graphic({
      attributes: {
        person,
        address: SingleLine
      },
      geometry: response.location,
      symbol: new SimpleMarkerSymbol({
        color: "red",
        outline: {
          width: 5,
          color: new Color([255,0,0,0.5])
        },
        size: 10
      }),
      popupTemplate: {
        title: "{person}",
        content: "{address}"
      }
    });
  }

  async function addressesToGraphics(){
    const promises = [];
    for(let person in addresses){
      promises.push(calculateAddressLocation(person))
    }

    return await Promise.all(promises);
  }

  async function addressesOnMap(){
    const graphics = await addressesToGraphics();
    view.graphics.addMany(graphics);
  }

})();