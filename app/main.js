var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/Graphic", "esri/Viewpoint", "esri/tasks/Locator", "esri/Color", "esri/widgets/Measurement", "esri/symbols", "esri/geometry", "esri/geometry/geometryEngine"], function (require, exports, EsriMap, MapView, Graphic, Viewpoint, Locator, Color, Measurement, symbols_1, geometry_1, geometryEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        function calculateAddressLocation(person) {
            return __awaiter(this, void 0, void 0, function () {
                var SingleLine, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            SingleLine = addresses[person];
                            return [4 /*yield*/, locator.addressToLocations({
                                    address: {
                                        SingleLine: SingleLine
                                    },
                                    maxLocations: 1
                                })];
                        case 1:
                            response = (_a.sent())[0];
                            return [2 /*return*/, new Graphic({
                                    attributes: {
                                        person: person,
                                        address: SingleLine
                                    },
                                    geometry: response.location,
                                    symbol: new symbols_1.SimpleMarkerSymbol({
                                        color: "red",
                                        outline: {
                                            width: 5,
                                            color: new Color([255, 0, 0, 0.5])
                                        },
                                        size: 10
                                    }),
                                    popupTemplate: {
                                        title: "{person}",
                                        content: "{address}"
                                    }
                                })];
                    }
                });
            });
        }
        function addressesToGraphics() {
            return __awaiter(this, void 0, void 0, function () {
                var promises, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            promises = [];
                            for (person in addresses) {
                                promises.push(calculateAddressLocation(person));
                            }
                            return [4 /*yield*/, Promise.all(promises)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        function addressesOnMap() {
            return __awaiter(this, void 0, void 0, function () {
                var graphics, boundary, centerPoint, distValues, stddev;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, addressesToGraphics()];
                        case 1:
                            graphics = _a.sent();
                            view.graphics.addMany(graphics);
                            boundary = getConvexHull(graphics.map(function (graphic) { return graphic.geometry; }))[0];
                            view.graphics.add(new Graphic({
                                geometry: boundary,
                                symbol: new symbols_1.SimpleFillSymbol({
                                    style: "solid",
                                    color: "rgba(0,0,255,0.1)",
                                    outline: {
                                        width: 2,
                                        color: "blue"
                                    }
                                })
                            }));
                            centerPoint = new Graphic({
                                attributes: {},
                                geometry: boundary.centroid,
                                symbol: new symbols_1.SimpleMarkerSymbol({
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
                            distValues = [];
                            graphics.forEach(function (graphic) {
                                var person = graphic.attributes.person;
                                var dist = calculateDistance(centerPoint.geometry, graphic.geometry);
                                distValues.push(dist);
                                addresses[person].prelimDistance = dist;
                                centerPoint.attributes[person] = dist;
                            });
                            stddev = standardDeviation(distValues);
                            console.log("stddev: ", stddev);
                            console.log("addresses: ", addresses);
                            view.graphics.add(centerPoint);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function getConvexHull(points) {
            return geometryEngine_1.convexHull(points, true);
        }
        function calculateDistance(center, vertex) {
            var line = new geometry_1.Polyline({
                paths: [[
                        [center.x, center.y],
                        [vertex.x, vertex.y]
                    ]]
            });
            return geometryEngine_1.geodesicLength(line, "miles");
        }
        function standardDeviation(values) {
            var avg = average(values);
            var squareDiffs = values.map(function (value) {
                var diff = value - avg;
                var sqrDiff = diff * diff;
                return sqrDiff;
            });
            var avgSquareDiff = average(squareDiffs);
            var stdDev = Math.sqrt(avgSquareDiff);
            return stdDev;
        }
        function average(data) {
            var sum = data.reduce(function (sum, value) {
                return sum + value;
            }, 0);
            var avg = sum / data.length;
            return avg;
        }
        var map, view, addresses, locator, calculateButton;
        return __generator(this, function (_a) {
            map = new EsriMap({
                basemap: "streets"
            });
            view = new MapView({
                map: map,
                container: "viewDiv",
                viewpoint: Viewpoint.fromJSON({ "rotation": 0, "scale": 36978595.474472, "targetGeometry": { "spatialReference": { "latestWkid": 3857, "wkid": 102100 }, "x": -10984650.679317374, "y": 5097967.601478441 } })
            });
            view.ui.add(new Measurement({
                view: view,
                activeTool: "distance"
            }), "top-right");
            addresses = {
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
            locator = new Locator({
                url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
            });
            calculateButton = document.getElementById("calculate");
            view.ui.add(calculateButton, "bottom-left");
            calculateButton.addEventListener("click", addressesOnMap);
            return [2 /*return*/];
        });
    }); })();
});
//# sourceMappingURL=main.js.map