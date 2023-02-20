/**
 * @file SmartMirror-Label-Display.js
 *
 * @author cstollen
 * @license MIT
 *
 * @see
 */

Module.register("SmartMirror-Label-Display", {
	defaults: {
		// Display
		image_width: 1920, // Width of the underlying image
		image_height: 1080, // Height of the underlying image
		maxFPS: 30, // Maximum display FPS
		showGesturesIcons: true, // Draws available icons for hand gestures
		// Labels
		lineWidth: 2, // Bounding box line width
		// Text captions
		textAbove: false, // Print text above or inside the label
		fontFamily: "Font Awesome 5 Free", // Label text font type
		fontSize: 24, // Label text font size
		textMargin: 3, // Margins of text to the bounding box in pixel
		// Colors
		textColor: "", // Color of label text; If empty defaults to color of bounding box
		gesturesColor: "red", // Color of gesture bounding boxes; If empty assigns different colors to classes (see colors.js)
		objectsColor: "blue", // Color of object bounding boxes
		facesColor: "orange", // Color of face bounding boxes
		personsColor: "green", // Color of person bounding boxes
		displayCamera: false, // If true displays camera image; If false node_helper and python is not used
	},

	gesturesList: [],
	objectsList: [],
	facesList: [],
	personsDict: {},
	showGestures: false,
	showObjects: false,
	showFaces: false,
	showPersons: false,
	fps: 0.0,
	timeSinceRefresh: 0,
	refreshCounter: 0,
	refreshCounterMax: 30,
	refreshTimer: 0,
	streamReady: false,

	/**
	 * Requests any additional stylesheets that need to be loaded.
	 * @return Additional style sheet filenames as array of strings.
	 */
	getStyles() {
		return ["font-awesome.css"];
	},

	/**
	 * Requests any additional scripts that need to be loaded.
	 * @return Additional script filenames as array of strings.
	 */
	getScripts: function () {
		return [
			"colors.js", // Label names and colors
		];
	},

	/**
	 * Called when all modules are loaded and the system is ready to boot up.
	 */
	start: function () {
		this.refreshTimer = performance.now();
		this.refreshRepeater = setInterval(this.refresh.bind(this), Math.ceil(1000 / this.config.maxFPS));
		if (this.config.displayCamera) {
			this.sendSocketNotification("CONFIG", this.config);
		}
		Log.info(this.name + " started!");
	},

	/**
	 * Called when module is suspended.
	 */
	suspend: function () {
		clearInterval(this.refreshRepeater);
		this.sendNotification("CENTER_DISPLAY_FPS", 0);
		Log.info(this.name + " suspended");
	},

	/**
	 * Called when module is resumed.
	 */
	resume: function () {
		Log.info(this.name + " resumed");
		this.refreshRepeater = setInterval(this.refresh.bind(this), Math.ceil(1000 / this.config.maxFPS));
	},

	/**
	 * Called when all modules have started.
	 */
	postinit: function () { },

	/**
	 * Refreshes the display.
	 */
	refresh: function () {
		// Calculate FPS
		const elapsedTime = performance.now() - this.refreshTimer;
		this.refreshCounter++;
		this.timeSinceRefresh += elapsedTime;
		if (this.refreshCounter >= this.refreshCounterMax) {
			const elapsedTimeMean = this.timeSinceRefresh / this.refreshCounter;
			this.fps = 1 / (elapsedTimeMean / 1000);
			this.sendNotification("CENTER_DISPLAY_FPS", this.fps.toFixed(2));
			// this.sendNotification("LABEL_DISPLAY_FPS", this.fps.toFixed(2));
			// Log.info("FPS DEBUG: " + this.fps.toFixed(2));
			this.refreshCounter = 0;
			this.timeSinceRefresh = 0;
		}

		this.refreshTimer = performance.now();
		this.updateDom();
	},

	/**
	 * Updates the information on screen by returning a current DOM object.
	 * @return The current DOM object in form of a div element.
	 */
	getDom: function () {
		var wrapper = document.createElement("div");

		// Draw gestures icons if available
		if (this.config.showGesturesIcons) {
			for (i = 0; i < this.gesturesList.length; i++) {
				const name = this.gesturesList[i]["name"];
				// Log.info("GESTURE " + name);
				if (name in gesture_icons) {
					// Log.info("ICON for " + name);
					var label = document.createElement("div");
					const w = this.config.image_width * this.gesturesList[i]["w_h"][0];
					const h = this.config.image_height * this.gesturesList[i]["w_h"][1];
					const x = this.config.image_width * this.gesturesList[i]["center"][0] - w;
					const y = this.config.image_height * this.gesturesList[i]["center"][1] - h / 2;
					label.style.position = "absolute";
					label.style.left = x + "px";
					label.style.top = y + "px";
					label.style.width = w * 2 + "px";
					label.style.height = h + "px";
					label.style.margin = "auto";
					// label.style.border = "3px solid red";
					label.style.border = "none";
					label.style.fontSize = h + "px";
					label.style.textAlign = "center";
					label.style.display = "inline-block";
					label.style.fontFamily = "Font Awesome 5 Free";
					label.style.fontWeight = "400";
					label.style.verticalAlign = "middle";
					// label.style.lineHeight = label.style.height;
					// label.style.lineWidth = label.style.width;
					label.className = gesture_icons[name].className;
					wrapper.appendChild(label);
				}
			}
		}

		// Draw gestures bounding boxes
		if (this.showGestures) {
			for (i = 0; i < this.gesturesList.length; i++) {
				var labelColor = "";
				if (this.config.gesturesColor === "") {
					const gestureIndex = gesture_names.indexOf(this.gesturesList[i]["name"]);
					labelColor = getColorForIndex(gestureIndex);
				} else {
					labelColor = this.config.gesturesColor;
				}
				var label = this.createLabel(
					labelColor,
					this.gesturesList[i]["center"],
					this.gesturesList[i]["w_h"],
					this.gesturesList[i]["name"],
					this.gesturesList[i]["TrackID"]
				);
				wrapper.appendChild(label);
			}
		}

		// Draw objects bounding boxes
		if (this.showObjects) {
			for (i = 0; i < this.objectsList.length; i++) {
				var label = this.createLabel(
					this.config.objectsColor,
					this.objectsList[i]["center"],
					this.objectsList[i]["w_h"],
					this.objectsList[i]["name"],
					this.objectsList[i]["TrackID"]
				);
				wrapper.appendChild(label);
			}
		}

		// Draw faces bounding boxes
		if (this.showFaces) {
			for (i = 0; i < this.facesList.length; i++) {
				var label = this.createLabel(
					this.config.facesColor,
					this.facesList[i]["center"],
					this.facesList[i]["w_h"],
					this.facesList[i]["name"],
					this.facesList[i]["TrackID"],
					this.facesList[i]["ID"],
					this.facesList[i]["confidence"].toFixed(2)
				);
				wrapper.appendChild(label);
			}
		}

		// Draw recognised persons with their face and gestures bounding boxes
		if (this.showPersons) {
			for (let idkey in this.personsDict) {
				var personLabel = this.createLabel(
					this.config.personsColor,
					this.personsDict[idkey]["center"],
					this.personsDict[idkey]["w_h"],
					this.personsDict[idkey]["name"],
					this.personsDict[idkey]["TrackID"]
				);
				wrapper.appendChild(personLabel);
				
				if (this.personsDict[idkey].hasOwnProperty('face')) {
					var faceLabel = this.createLabel(
						this.config.faceColor,
						this.personsDict[idkey]["face"]["center"],
						this.personsDict[idkey]["face"]["w_h"],
						this.personsDict[idkey]["face"]["name"],
						this.personsDict[idkey]["face"]["TrackID"],
						this.personsDict[idkey]["face"]["ID"],
						this.personsDict[idkey]["face"]["confidence"].toFixed(2)
					);
					wrapper.appendChild(faceLabel);
				}
				
				if (this.personsDict[idkey].hasOwnProperty('gestures')) {
					for (i = 0; i < this.personsDict[idkey].gestures.length; i++) {
						var gestureLabel = this.createLabel(
							this.config.gesturesColor,
							this.personsDict[idkey]["gestures"][i]["center"],
							this.personsDict[idkey]["gestures"][i]["w_h"],
							this.personsDict[idkey]["gestures"][i]["name"],
							this.personsDict[idkey]["gestures"][i]["TrackID"]
						);
						wrapper.appendChild(gestureLabel);
					}
				}
			}
		}

		return wrapper;
	},

	/**
	 * Creates a bounding box for a given label in darknet format.
	 * @param labelColor Color for the label bounding box.
	 * @param center Center of label relative to image as [x,y] array. range: [0,1]
	 * @param dimensions Dimensions of label relative to image as [width,height] array. range: [0,1]
	 * @param name Name of the label class as string.
	 * @param trackid The tracking id for the recognised entity.
	 * @param ID Optional id for the recognised entity.
	 * @param confidence Optional confidence for the recognised entity.
	 * @return The label as div element.
	 */
	createLabel: function (labelColor, center, dimensions, name = "", trackid = -1, ID = -1, confidence = -1) {
		// Create bounding box for given darknet label
		var label = document.createElement("div");
		const w = this.config.image_width * dimensions[0];
		const h = this.config.image_height * dimensions[1];
		const x = this.config.image_width * center[0] - (w / 2) - this.config.lineWidth;
		const y = this.config.image_height * center[1] - (h / 2) - this.config.lineWidth;
		label.style.position = "absolute";
		label.style.left = x + "px";
		label.style.top = y + "px";
		label.style.width = w + "px";
		label.style.height = h + "px";
		label.style.margin = "0px";
		label.style.padding = "0px";
		label.style.border = this.config.lineWidth + "px solid";

		// Color bounding box
		label.style.borderColor = labelColor;

		// Create label text
		var labelString = name;
		if (!this.config.textAbove) {
			labelString += "\n";
		}
		if (trackid >= 0) {
			labelString += " ID:" + trackid;
			if (!this.config.textAbove) {
				labelString += "\n";
			}
		}
		if (ID >= 0) {
			labelString += " pid:" + ID;
			if (!this.config.textAbove) {
				labelString += "\n";
			}
		}
		if (confidence >= 0) {
			labelString += " conf:" + confidence;
		}

		// Place label text
		if (labelString != "") {
			var labelText = document.createElement("div");
			labelText.style.position = "absolute";
			if (this.config.textAbove) {
				labelText.style.whiteSpace = "nowrap";
				labelText.style.top = -this.config.fontSize - this.config.textMargin + "px";
			} else {
				labelText.style.top = this.config.textMargin + "px";
			}
			labelText.style.fontSize = this.config.fontSize + "px";
			labelText.style.left = this.config.textMargin + "px";
			labelText.style.height = labelText.style.fontSize;
			labelText.style.fontFamily = this.config.fontFamily;
			if (this.config.textColor === "") {
				labelText.style.color = label.style.borderColor;
			} else {
				labelText.style.color = this.config.textColor;
			}
			labelText.style.lineHeight = this.config.fontSize + "px";
			labelText.innerText = labelString;
			label.appendChild(labelText);
		}

		return label;
	},

	/**
	 * MagicMirror socket notification handler.
	 * @param notification The notification identifier as a string.
	 * @param payload The notification payload.
	 */
	socketNotificationReceived: function (notification, payload) {
		if (notification === "STREAM") {
			if (payload === "READY") {
				Log.info(this.name + " camera stream ready");
				this.streamReady = true;
			} else if (payload === "HALT") {
				this.streamReady = false;
			}
		}
	},

	/**
	 * MagicMirror notification handler.
	 * @param notification The notification identifier as a string.
	 * @param payload The notification payload.
	 * @param sender The identification of the notification sender.
	 */
	notificationReceived: function (notification, payload, sender) {
		if (notification === "ALL_MODULES_STARTED") {
			this.postinit();
		} else if (notification === "/gesture_det/gestures") {
			// Format of gesture detection payload:
			// {"DETECTED_GESTURES": [{"TrackID": int, "name": string, "w_h": (float, float), "center": (float, float)}]}
			const json_obj = JSON.parse(payload);
			const gesturesList = json_obj["DETECTED_GESTURES"];

			// Fetch gestures_list from gesture recognition
			if (gesturesList.length > 0) {
				this.gesturesList = gesturesList;
			} else {
				// No gestures detected
				if (this.gesturesList.length > 0) {
					this.gesturesList = [];
				}
			}
		} else if (notification === "/object_det/objects") {
			// Format of object detection payload:
			// {"DETECTED_OBJECTS": [{"TrackID": int, "name": string, "w_h": (float, float), "center": (float, float)}]}
			const json_obj = JSON.parse(payload);
			const objectsList = json_obj["DETECTED_OBJECTS"];
			//Log.info(payload)


			// Fetch tracked_dets from object detection
			if (objectsList.length > 0) {
				this.objectsList = objectsList;
			} else {
				// No objects detected
				if (this.objectsList.length > 0) {
					this.objectsList = [];
				}
			}
		} else if (notification === "/face_det/json_out") {
			// Format of face detection payload:
			// {"DETECTED_FACES": [{"TrackID": int, "name": string, "w_h": (float, float), "center": (float, float), "ID": int, "confidence": float}]}
			const json_obj = JSON.parse(payload);
			const facesList = json_obj["DETECTED_FACES"];
			//Log.info(payload)

			// Fetch detection_list from face detection
			if (facesList.length > 0) {
				this.facesList = facesList;
			} else {
				// No faces detected
				if (this.facesList.length > 0) {
					this.facesList = [];
				}
			}
		} else if (notification === "RECOGNIZED_PERSONS") {
			// Format of person recognition payload:
			// {"RECOGNIZED_PERSONS": {int: {"TrackID": int, "name": string, "w_h": [float, float], "center": [float, float]}, "face": {...}, "gestures": [...]}}
			const personsDict = payload["RECOGNIZED_PERSONS"];
			var newPersonsDict = {};
			for (let idkey in personsDict) {
				if (personsDict[idkey] != undefined) {
					newPersonsDict[idkey] = personsDict[idkey];
				}
			}

			// Fetch detection_list from person recognition
			if (Object.keys(newPersonsDict).length > 0) {
				this.personsDict = newPersonsDict;
			} else {
				if (Object.keys(this.personsDict).length > 0) {
					this.personsDict = {};
				}
			}
			//this.printPersonsDict(this.personsDict);
		} else if (notification === "LABEL_DISPLAY" || notification === "CENTER_DISPLAY") {
			const setting = payload;
			Log.info("Change setting for label display: " + setting);
			switch (setting) {
				case "GESTURE":
					this.showGestures = !this.showGestures;
					return;
				case "OBJECT":
					this.showObjects = !this.showObjects;
					return;
				case "FACE":
					this.showFaces = !this.showFaces;
					return;
				case "PERSON":
					this.showPersons = !this.showPersons;
					return;
				case "SHOWALL":
					this.showGestures = true;
					this.showObjects = true;
					this.showFaces = true;
					this.showPersons = false;
					return;
				case "HIDEALL":
					this.showGestures = false;
					this.showObjects = false;
					this.showFaces = false;
					this.showPersons = false;
					return;
			}
		} else if (notification === "GESTURE_DET_FPS") {
		} else if (notification === "OBJECT_DET_FPS") {
		} else if (notification === "FACE_DET_FPS") {
		}
	},

	/**
	 * Debug helper function for printing recognition entities.
	 * @param entityList List of recognised entities.
	 */
	printDetectionList: function (entityList) {
		// Print received darknet detection entity
		for (i = 0; i < entityList.length; i++) {
			Log.info("entity " + i + ":");
			Log.info("  TrackID: " + entityList[i]["TrackID"]);
			Log.info("  center: " + entityList[i]["center"]);
			Log.info("  w_h: " + entityList[i]["w_h"]);
			Log.info("  name: " + entityList[i]["name"]);
			if (entityList[i]["ID"]) {
				Log.info("  ID: " + entityList[i]["ID"]);
			}
			if (entityList[i]["confidence"]) {
				Log.info("  confidence: " + entityList[i]["confidence"]);
			}
			if (entityList[i]["face"]) {
				Log.info("  face:");
				Log.info("    center: " + entityList[i]["face"]["center"]);
				Log.info("    w_h: " + entityList[i]["face"]["w_h"]);
			}
			if (entityList[i]["gestures"]) {
				Log.info("  gestures found: " + Object.keys(entityList[i]["gestures"]));
			}
		}
	},

	/**
	 * Debug helper function for printing person recognition dictionary.
	 * @param personsDict Dictionary of recognised person.
	 */
	printPersonsDict: function (personsDict) {
		if (personsDict != undefined) {
			Log.info(personsDict);

			/**
			for (let idkey in personsDict) {
				Log.info("Person " + idkey + ":");
				if (personsDict[idkey] != undefined) {
					const person = personsDict[idkey];
					for (let persKey in person) {
						if (person[persKey] != undefined) {
							if (persKey === "face") {
								Log.info("  face:");
								Log.info("    center: " + person["face"]["center"]);
								Log.info("    w_h: " + person["face"]["w_h"]);
							} else if (persKey === "gestures") {
								if (person["gestures"].length > 0) {
									Log.info("  gestures:");
									for (i = 0; i < person["gestures"].length; i++) {
										Log.info("    name: " + person["gestures"][i]["name"]);
										Log.info("    center: " + person["gestures"][i]["center"]);
										Log.info("    w_h: " + person["gestures"][i]["w_h"]);
									}
								}
							} else {
								Log.info("  " + persKey + ": " + personsDict[idkey][persKey]);
							}
						} else {
							Log.info("printPersonsDict: personsDict[" + idkey + "][" + persKey + "] is undefined");
						}
					}
				} else {
					Log.info("printPersonsDict: personsDict[" + idkey + "] is undefined");
				}
			}
		} else {
			Log.info("printPersonsDict: personsDict is undefined");  */
		}
	},
});
