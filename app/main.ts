import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Graphic = require("esri/Graphic");
import Viewpoint = require("esri/Viewpoint");
import Locator = require("esri/tasks/Locator");
import Color = require("esri/Color");
import Measurement = require("esri/widgets/Measurement");
import { SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol } from "esri/symbols";
import { Geometry, Point, Polygon, Polyline } from "esri/geometry";
import { convexHull, geodesicLength } from "esri/geometry/geometryEngine";

(async () => {

  const map = new EsriMap({
    basemap: "streets"
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    viewpoint: Viewpoint.fromJSON({"rotation":0,"scale":36978595.474472,"targetGeometry":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":-10984650.679317374,"y":5097967.601478441}})
  });

  view.ui.add(new Measurement({
    view,
    activeTool: "distance"
  }), "top-right");

  const addresses = {
    Sol: {
      address: "7831 Gray Eagle drive, Zionsville, IN 46077",
      prelimDistance: 0,
      finalDistance: 0
    },
    Jo: {
      address: "Springville, UT",
      prelimDistance: 0,
      finalDistance: 0
    },
    Beck: {
      address: "4269 E Linda Ln, Gilbert, AZ 85234",
      prelimDistance: 0,
      finalDistance: 0
    },
    Ez: {
      address: "4992 S 950 E, SOUTH OGDEN, UT 84403",
      prelimDistance: 0,
      finalDistance: 0
    },
    Beej: {
      address: "4762 E TIMBERLINE RD, GILBERT, AZ 85297",
      prelimDistance: 0,
      finalDistance: 0
    },
    Penny: {
      address: "Mesa, Arizona",
      prelimDistance: 0,
      finalDistance: 0
    },
    Kross: {
      address: "10427 Beryl Ave., Mentone, CA 92359",
      prelimDistance: 0,
      finalDistance: 0
    },
    Agee: {
      address: "Arizona City, AZ",
      prelimDistance: 0,
      finalDistance: 0
    }
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

    const boundary: Polygon = getConvexHull(graphics.map(graphic => graphic.geometry as any))[0];

    view.graphics.add(new Graphic({
      geometry: boundary,
      symbol: new SimpleFillSymbol({
        style: "solid",
        color: "rgba(0,0,255,0.1)",
        outline: {
          width: 2,
          color: "blue"
        }
      })
    }));

    const centerPoint = new Graphic({
      attributes: {  },
      geometry: boundary.centroid,
      symbol: new SimpleMarkerSymbol({
        style: "x",
        color: "black",
        size: 10,
        outline: {
          width: 2,
          color: "black"
        }
      }),
      popupTemplate: {
        content: "Sol: {Sol}\nJo: {Jo}\nBeck: {Beck}\nEz: {Ez}\nBeej: {Beej}\nPenny: {Penny}\nKross: {Kross}\nAgee: {Agee}"
      }
    });

    const distValues: number[] = []

    graphics.forEach(graphic => {
      const person = graphic.attributes.person;
      const dist = calculateDistance(centerPoint.geometry as Point, graphic.geometry as Point);
      distValues.push(dist);
      addresses[person].prelimDistance = dist;
      centerPoint.attributes[person] = dist;
    });



    const stddev = standardDeviation(distValues);
    console.log("stddev: ", stddev);
    console.log("addresses: ", addresses);

    view.graphics.add(centerPoint);

  }

  function getConvexHull(points: Point[]){
    return convexHull(points as any, true);
  }

  function calculateDistance(center: Point, vertex: Point){
    const line = new Polyline({
      paths: [[
        [center.x, center.y],
        [vertex.x, vertex.y]
      ]]
    });

    return geodesicLength(line, "miles");
  }


function standardDeviation(values: number[]){
  var avg = average(values);

  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data:number[]){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

})();